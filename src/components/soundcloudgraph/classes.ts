import { clamp, Color } from "$lib/utils";
import { GraphEdge, GraphManager, GraphNode } from "../graph/classes";

import type { SoundcloudEdgeData, SoundcloudGraphDataset, SoundcloudNodeData } from "$lib/soundcloud/types/native";
import { base } from "$app/paths";
import { getColorAsync, getPaletteAsync } from "$lib/colorthiefextensions";
import { Vec2 } from "$lib/vec2";
import type { ImmutableVec2 } from "$lib/vec2"
import { Transform } from "panzoom";

const abs = Math.abs
const sqrt = Math.sqrt
const max = Math.max
const pow = Math.pow
const min = Math.min

const REPEL_SOFTNESS              = 2;     // to avoid NaN if nodes are very close
const AMBIENT_REPEL_STRENGTH      = 1200; // inverse square multiplier
const FAR_AWAY_FROM_CENTER_THRESH = 1700;  // min "far" distance

const THINNING_FACTOR             = 30;

const EDGE_RATE                   = 0.1;

const BASE_NODE_SIZE              = 32;

const ZOOM_TRANSITION_TIME        = 750;
const ZOOM_SCALE_MUL              = 100;
const UNFOCUS_DRAG_DIST           = 10;

export const LIKES_SIZE_MUL     = 1.5;
export const FAVORITES_SIZE_MUL = 6;
export const RELICS_SIZE_MUL    = 9;

export class SoundcloudEdge extends GraphEdge<SoundcloudNodeData, SoundcloudEdgeData, SoundcloudNode> {

    public get width() {
        return max(this.to.edgeWidth, this.from.edgeWidth) * 3;
    }

    public readonly color: Color = Color.BLACK;
    constructor(private manager: SoundcloudGraphManager, data: SoundcloudEdgeData){
        super(manager, data);
    }

    private $lastToPalette: Color[] = [];
    private $lastFromPalette: Color[] = [];

    private toColor: Color = Color.BLACK;
    private fromColor: Color = Color.BLACK;

    public override get verts(): [Vec2, Color][] {

        if( this.width === 0 ) return [];

        if( this.to.palette !== this.$lastToPalette ){
            this.$lastToPalette = this.to.palette;
            this.toColor = this.to.palette[ Math.floor(Math.random() * this.to.palette.length) ]; // pick randomly
        }

        if( this.from.palette !== this.$lastFromPalette ){
            this.$lastFromPalette = this.from.palette;
            this.fromColor = this.from.palette[ Math.floor(Math.random() * this.from.palette.length) ]; // pick randomly
        }

        let original: [Vec2, Color][];

        const to   = this.to.pos.copy;
        const from = this.from.pos.copy;

        const normal = this.normal;

        // actual value here is 0.75 (why??) but I use 0.65 to hide my shitty math that's making this boundary slightly offset from where it should be 💀
        const offsetScaledTo   = normal.copy.scaleBy(this.to.diameter * 0.65);
        const offsetScaledFrom = normal.copy.scaleBy(this.from.diameter * 0.65);

        // fix the endpoints so they're on the edge of the node instead of the center
        to.subV( offsetScaledTo );
        from.addV( offsetScaledFrom );

        const size = this.manager.selfComputedSize;
        const x = size.width * 0.5;
        const y = size.height * 0.5;
        const center = this.manager.offsetPos ?? Vec2.ZERO;

        // transform the base points since coordinates are jank here
        to.add(x - center.x, y - center.y);
        from.add(x - center.x, y - center.y);

        // make these perpendicular now
        offsetScaledTo.pivot90CCW();
        offsetScaledFrom.pivot90CCW();

        // and shrink them because 0.6 * diameter will be way too thick
        offsetScaledTo.scaleBy(0.05 * this.width);
        offsetScaledFrom.scaleBy(0.05 * this.width);

        if( this.bidirectional )
            original = [ 
                [to.copy.scaleBy(THINNING_FACTOR - 1).addV(from).scaleBy(1 / THINNING_FACTOR), this.toColor],
                [from.copy.addV(offsetScaledFrom), this.fromColor],
                [from.copy.subV(offsetScaledFrom), this.fromColor],
                [from.copy.scaleBy(THINNING_FACTOR - 1).addV(to).scaleBy(1 / THINNING_FACTOR), this.fromColor],
                [to.copy.subV(offsetScaledTo), this.toColor],
                [to.copy.addV(offsetScaledTo), this.toColor],
            ];
        else
            original = [ 
                [to.copy.subV(from).scaleBy(1.5).addV(from), this.fromColor], // these fade a little fast, so make the edge extra "too long" so it's just right in practice
                [from.copy.addV(offsetScaledFrom), this.fromColor],
                [from.copy.subV(offsetScaledFrom), this.fromColor],
            ];

        return original;
    }

    public getSerialized(): SoundcloudEdgeData {
        return {
            from: this.from.id,
            to:   this.to.id,
        }
    }

    public doForces() {
        const fromNode  = this.from!;
        const toNode = this.to!;

        const dist = fromNode.pos.distance(toNode.pos);
        let factor = clamp( (dist - toNode.diameter - fromNode.diameter) * 0.05, -0.2, 1) * 
                     (1 + this.width * 0.25) * 
                     (0.5 * fromNode.fewFollowingMul + 0.5 * toNode.fewFollowingMul) *
                     ( (0.5 * fromNode.diameter + 0.5 * toNode.diameter) / BASE_NODE_SIZE ) *
                     (this.bidirectional ? 2 : 0.5);

        const dir  = toNode.pos.copy.subV(fromNode.pos).scaleBy(factor / dist);

        fromNode.vel.addV(dir);
        toNode.vel.subV(dir);

    }

}


export class SoundcloudNode extends GraphNode<SoundcloudNodeData, SoundcloudEdgeData, SoundcloudEdge> {

    declare readonly manager: SoundcloudGraphManager;

    private _edgeWidth: number = 0;
    public selected_: boolean = false;
    public get edgeWidth() {
        return this._edgeWidth;
    }

    private _fewFollowingMul!: number;
    public get fewFollowingMul(){
        return (
            this._fewFollowingMul ??= 1 / ( // only calculate it once
                min(
                    0.1 * this.edges.reduce<number>( 
                        (acc, e) => acc + (e.bidirectional ? 1 : 0.5), 
                        0 
                    ),
                    4
                )
            )
        );
    }

    private _diameter!: number;
    public get diameter(){
        return this._diameter ??= (
            BASE_NODE_SIZE +                       // base size
            this.data.artist.likes_count * LIKES_SIZE_MUL +
            this.data.artist.favorites_count * FAVORITES_SIZE_MUL +
            this.data.artist.relics_count * RELICS_SIZE_MUL
        );
    }

    // artists with large followings need the extra circumference
    private _trueDiameter!: number;
    public get trueDiameter(){
        return this._trueDiameter ??= max(this.diameter * 2, BASE_NODE_SIZE + this.data.artist.followers_count * 0.0005);
    }

    private _palette?: Color[];
    public get palette(): Color[] {
        return this._palette ?? [Color.BLACK];
    }

    constructor(manager: SoundcloudGraphManager, data: SoundcloudNodeData){

        super(manager, data);

        const {artist, track} = data;

        this.vel.addV( new Vec2( Math.random() * 2 - 1, Math.random() * 2 - 1 ).scaleBy(20) );
        this.pos = new Vec2( Math.random() * 2 - 1, Math.random() * 2 - 1 ).scaleBy(100);

        (this.html.querySelector(".text-outline")! as HTMLDivElement).innerText = artist.username;

        this.html.style.setProperty('--scale', `${this.diameter / BASE_NODE_SIZE}`);

        (this.html as any).__self__ = this; // :)
        (this.html.querySelector(".text-main")! as HTMLDivElement).innerText = artist.username;

        // use img instead for pointer events and stuff since its hitbox is actually circular (unlike the div)
        const img = this.html.querySelector("img") as HTMLImageElement;

        // img.crossOrigin = "Anonymous";
        // img.src = artist.avatar_url ?? `${base}/assets/soundcloud/missing.png`;

        img.addEventListener('click', (e) => {
            if( this.manager.dragging ) {
                this.manager.setFocusedNode(null)
                return;
            };
            console.log("clicked", this.data.artist.username);
            this.manager.setFocusedNode(this);
        });

        
        // getPaletteAsync(img).then( colors => {
        //     if( !colors ) return;
        //     this._palette = colors.map( (rgb: [number, number, number]) => {
        //         let actualColor = new Color(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255);
        //         let hsv = actualColor.toHSV();
        //         hsv.v = max(0.8, hsv.v);
        //         hsv.s = min(0.6, hsv.s);
        //         return Color.fromHSV(hsv.h, hsv.s, hsv.v); // make it brighter
        //     } )
        // } );
    }

    private _neighbors!: SoundcloudNode[];

    public get neighbors(): SoundcloudNode[] {
        return this._neighbors ?? (
            this._neighbors = this.edges.map( (edge) => (edge.from === this ? edge.to : edge.from) )
        )
    }

    // abstract implementations
    public override setPos(x: number, y: number): void {
        this.pos.setTo(x, y);
    }

    public doRepulsionForce(that: SoundcloudNode) {
        let repel_dist = this.pos.distance(that.pos) + REPEL_SOFTNESS;
        const f = this.pos.copy.subV(that.pos).scaleBy( 
            (-AMBIENT_REPEL_STRENGTH / (repel_dist**3)) * (this.trueDiameter + that.trueDiameter)
        )

        that.vel.addV(f);
        this.vel.subV(f);
    }

    private doCenterSeekingForce(){
        const len = this.pos.length();
        const scale = clamp(len - FAR_AWAY_FROM_CENTER_THRESH, 0, Infinity) / len;
        this.vel.addV( this.pos.copy.scaleBy(scale * -0.001 * this.trueDiameter) );
    }

    public override doPositioning(){
        this._edgeWidth = clamp(this._edgeWidth + EDGE_RATE * (this.selected_ ? 1 : -1), 0, 1);
        this.vel.scaleBy(0.6);
        this.pos.addV(this.vel);
    }

    public doForces(){ 
        this.doCenterSeekingForce();
    }

    public getSerialized(): SoundcloudNodeData {
        return {
            ...this.data,
        }
    }

    public override render(){
        const center = this.manager.offsetPos;
        const size = this.manager.selfComputedSize;
        this.style.transform = `
        translate(
            ${this.pos.x - center.x + size.width / 2}px, 
            ${this.pos.y - center.y + size.height / 2}px
        ) 
        `;
    }
    
}


export class SoundcloudGraphManager
extends GraphManager<
    SoundcloudNodeData,
    SoundcloudEdgeData,
    SoundcloudEdge,
    SoundcloudNode
> {

    protected get frametime(){
        return 30;
    }

    public  held:          boolean = false;
    public  dragging:      boolean = false;
    private focusChanged:  boolean = false;


    private focusedNode: SoundcloudNode | null = null;

    private firstDragTransform: Transform | null = null;

    public setFocusedNode(node: SoundcloudNode | null){

        if( node === this.focusedNode ) return;

        const transform = this.getPanzoomTransform();
        const instant = this.transformToCanvas( (this.focusedNode?.pos ?? new Vec2(0,0)).copy.scaleBy(-1) ) ;
        const deferred = new Vec2();

        this.focusChanged = true;

        if( this.focusedNode ){
            this.focusedNode.selected_ = false;

        }

        this.focusedNode = node;

        if( node ){
            node.selected_ = true;
            instant.addV( this.transformToCanvas(node.pos.copy) );
        }

        instant.scaleBy( transform.scale );

        this.firstDragTransform = null;

        this.simulationToPanzoomOrigin(deferred);
        this.simulationToPanzoomOrigin(instant);

        this.panzoom!.moveTo( ...instant.extract() );
        
        if( node ){
            setTimeout( () => {
                this.panzoom!.smoothMoveTo( ...deferred.extract() )
            }, 500)
        }

    }
    
    public get offsetPos(): ImmutableVec2 {
        const  pos = this.focusedNode?.pos ?? Vec2.ZERO;
        return pos.copy;
    }

    public override preSimulate(): void {
        const nodes = Array.from( this.nodes.values() );
        for( let i = 0; i < nodes.length; i++ ){
            const node1 = nodes[i];
            for( let j = i + 1; j < nodes.length; j++ ){
                node1.doRepulsionForce(nodes[j]);
            }
        }
    }

    // Transforms a document coordinate (clientX, clientY) to a simulation coordinate.  Self-modifies.
    public documentToSimulation(v: Vec2): Vec2 {
        const thisParentBox = this.parentBox;
        const pzTransform = this.panzoom!.getTransform();

        return v.setTo(
            (v.x - thisParentBox.left - pzTransform.x) / pzTransform.scale - thisParentBox.width / 2,
            (v.y - thisParentBox.top  - pzTransform.y) / pzTransform.scale - thisParentBox.height / 2
        );
    }

    public simulationToUVs(v: Vec2): Vec2 {
        const thisParentBox = this.parentBox;
        const pzTransform = this.panzoom!.getTransform();

        return v.setTo(
            ( (v.x + thisParentBox.width / 2) * pzTransform.scale + pzTransform.x ) / thisParentBox.width,
            ( (v.y + thisParentBox.height / 2) * pzTransform.scale + pzTransform.y ) / thisParentBox.height
        );
    }

    public UVsToSimulation(v: Vec2): Vec2 {
        const thisParentBox = this.parentBox;
        const pzTransform = this.panzoom!.getTransform();

        return v.setTo(
            (v.x * thisParentBox.width - pzTransform.x) / pzTransform.scale - thisParentBox.width / 2,
            (v.y * thisParentBox.height - pzTransform.y) / pzTransform.scale - thisParentBox.height / 2
        );
    }

    public UVsToPanzoomOffset(v: Vec2): Vec2 {
        return v.setTo(
            this.parentBox.width * 0.5 * ( v.x - 0.5 ),
            this.parentBox.height * 0.5 * ( v.y - 0.5 )
        );
    }

    public panzoomOffsetToUVs(v: Vec2): Vec2 {
        return v.setTo(
            v.x / this.parentBox.width + 0.5,
            v.y / this.parentBox.height + 0.5
        );
    }

    public simulationToPanzoomOrigin(v: Vec2): Vec2 {
        const pzTransform = this.panzoom!.getTransform();
        const thisParentBox = this.parentBox;

        this.simulationToUVs(v);
        v.add(-0.5, -0.5);
        v.scaleBy(2);

        return v.setTo(
            thisParentBox.width * ( 1 - pzTransform.scale + v.x ) / 2,
            thisParentBox.height * ( 1 - pzTransform.scale + v.y ) / 2,
        )
    }

    public override get fragmentShader(): string {
        return `#version 300 es

        precision highp float;

        in vec4 v_color;
        in vec3 v_barycentric;

        out vec4 outColor;

        float lightFalloff(float dist) {
            return dist * dist * dist * 16.0;
        }

        void main() {
            float dist = min(v_barycentric.y, v_barycentric.z);
            float a = lightFalloff(dist);
            outColor = vec4(v_color.xyz * a, a);
        }`
    }

    constructor(templateNode: HTMLElement, nodeContainer: HTMLElement, lineContainer: HTMLCanvasElement, data: SoundcloudGraphDataset){
        super(templateNode, nodeContainer, lineContainer, data, {
                bounds: false,
                zoomDoubleClickSpeed: 1,
                zoomSpeed: 0.1,
                minZoom: 0.1,
                maxZoom: 10,
        });
        (window as any).manager = this;
        this.handleResize();


        this.panzoom!.on('pan', () => {
            if( !this.held ) return;
            this.firstDragTransform ??= this.getPanzoomTransform();
            let curDragTransform = this.panzoom!.getTransform();

            if( sqrt(
                ( this.firstDragTransform.x - curDragTransform.x ) ** 2 +
                ( this.firstDragTransform.y - curDragTransform.y ) ** 2
            ) > 50 ) {
                console.log('dragging')
                this.dragging = true;
                this.setFocusedNode(null);
            }
        });

        const wheel = (e: WheelEvent) => {
            this.setFocusedNode(null);
        }

        this.edgeContainer.addEventListener('wheel', wheel)
        this.nodeContainer.addEventListener('wheel', wheel)

        const mouseUp = () => {
            setTimeout(() => {
                if( !this.focusChanged ) {
                    this.setFocusedNode(null);
                }
                this.held               = false;
                this.dragging           = false;
                this.focusChanged       = false;
                this.firstDragTransform = null;
            })
        };

        this.nodeContainer.addEventListener('mouseup', mouseUp);
        this.edgeContainer.addEventListener('mouseup', mouseUp);

        const mouseDown = (e: MouseEvent) => {
            this.held         = true;
            this.dragging     = false;
            this.focusChanged = false;

            let uv = this.documentToSimulation(new Vec2(e.clientX, e.clientY));
            console.log("simulation coords", uv)
            this.simulationToPanzoomOrigin(uv);
            console.log("panzoom transform?", uv)

            let pzTransform = this.panzoom!.getTransform();
            let pzVec = new Vec2(pzTransform.x, pzTransform.y);
            
            console.log("panzoom transform", pzVec)
            this.panzoomOffsetToUVs(pzVec);
            console.log("uniform coords", pzVec)

            this.panzoom!.moveTo(uv.x, uv.y);
        };

        this.nodeContainer.addEventListener('mousedown', mouseDown);
        this.edgeContainer.addEventListener('mousedown', mouseDown);

        // this.panzoom!.zoomAbs(this.nodeContainer.clientWidth / 2, this.nodeContainer.clientHeight / 2, 0.35);

        // window.setTimeout(() => {
        //     this.panzoom!.smoothZoomAbs(this.nodeContainer.clientWidth / 2, this.nodeContainer.clientHeight / 2, 0.35);
        // }, 1000);

        // draw brighter edges (bidirectional followings) on top
        this.gl_ctx.enable(this.gl_ctx.BLEND);
        this.gl_ctx.blendFuncSeparate(this.gl_ctx.SRC_ALPHA, this.gl_ctx.ONE, this.gl_ctx.ZERO, this.gl_ctx.ONE);
        //this.gl_ctx.blendEquation(this.gl_ctx.FUNC_ADD);
    }

    protected getPanzoomTransform(): Transform {
        return {...this.panzoom!.getTransform()};
    }

    protected override createNode(data: SoundcloudNodeData): SoundcloudNode {
        return new SoundcloudNode(this, data);
    }

    protected override createEdge(data: SoundcloudEdgeData): SoundcloudEdge {
        return new SoundcloudEdge(this, data);
    }

    public serialize(): void {
        const nodes = Array.from(this.nodes.values()).map(node => node.getSerialized());
        const edges = Array.from(this.edges.values()).map(edge => edge.getSerialized());
        
        const json = JSON.stringify({ nodes, edges });

        let element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(json));
            element.setAttribute('download', 'graph_soundcloud.json');
          
            element.style.display = 'none';
            document.body.appendChild(element);
          
            element.click();
        document.body.removeChild(element);
    }
    

}