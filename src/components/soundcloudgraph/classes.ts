import { clamp, Color, Vec2 } from "$lib/utils";
import type { ImmutableVec2 } from "$lib/utils";
import { PanZoomOptions } from "panzoom";
import { GraphEdge, GraphManager, GraphNode } from "../graph/classes";

import type { SoundcloudEdgeData, SoundcloudGraphDataset, SoundcloudNodeData } from "$lib/soundcloud/types/native";
import { base } from "$app/paths";

const abs = Math.abs
const sqrt = Math.sqrt
const max = Math.max
const pow = Math.pow
const min = Math.min

const REPEL_SOFTNESS              = 2;     // to avoid NaN if nodes are very close
const AMBIENT_REPEL_STRENGTH      = 1200; // inverse square multiplier
const FAR_AWAY_FROM_CENTER_THRESH = 1700;  // min "far" distance

const THINNING_FACTOR             = 5;

const EDGE_RATE                   = 0.1;

const BASE_NODE_SIZE = 32;

export class SoundcloudEdge extends GraphEdge<SoundcloudNodeData, SoundcloudEdgeData, SoundcloudNode> {

    public get width() {
        return max(this.to.edgeWidth, this.from.edgeWidth) * 4;
    }

    public readonly COLOR: Color;
    public get color() {
        return this.COLOR;
    }

    constructor(private manager: SoundcloudGraphManager, data: SoundcloudEdgeData){
        super(manager, data);

        let a = Math.random() * 0.3 + 0.7;

        this.COLOR = this.bidirectional ?
            new Color(0, 0, 0, 0.5) :
            new Color(0, 0, 0, 0.5);
    }

    public override get verts(): Vec2[] {

        if( this.width === 0 ) return [];

        let original: Vec2[] = super.verts;

        // const to   = this.to.pos.copy;
        // const from = this.from.pos.copy;

        // const offset = this.normal;

        // // fix the endpoints so they're on the edge of the node instead of the center
        // to.subV( offset.copy.scaleBy(this.to.diameter * 0.75) );     // I have no idea why this is 0.75 and not 0.5
        // from.addV( offset.copy.scaleBy(this.from.diameter * 0.75) );

        // // now actually make it the perpendicular offset we needed
        // offset.scaleBy(this.width);
        // offset.pivot90CCW();

        // if( this.bidirectional ){
        //     original = [ 
        //         // New idea, thinner in the middle.  Costs the same as a thick line but looks more like WoG.  Brains are stupid and see this shit as curved even though it isn't.
        //         to.copy.scaleBy(THINNING_FACTOR - 1).addV(from).scaleBy(1 / THINNING_FACTOR),
        //         from.copy.addV(offset),
        //         from.copy.subV(offset),
        //         from.copy.scaleBy(THINNING_FACTOR - 1).addV(to).scaleBy(1 / THINNING_FACTOR),
        //         to.copy.subV(offset),
        //         to.copy.addV(offset),
        //     ]
        // }
        // else { // arrows
        //     original = [
        //         to.copy,
        //         from.copy.addV(offset),
        //         from.copy.subV(offset),
        //     ]
        // }

        const size = this.manager.selfComputedSize;
        const x = size.width * 0.5;
        const y = size.height * 0.5;
        let center = this.manager.focusOffset;
        for( let vert of original ){
            vert.x += x;
            vert.y += y;
            center ? vert.subV(center) : null;
        }
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
    private _isHovered: boolean = false;
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
            this.data.artist.likes_count * 1.5 +   // my likes on them
            this.data.artist.favorites_count * 6 + // my favorites on them
            this.data.artist.relics_count * 9     // my relics on them (old favorites)
        );
    }

    // artists with large followings need the extra circumference
    private _trueDiameter!: number;
    public get trueDiameter(){
        return this._trueDiameter ??= max(this.diameter * 2, BASE_NODE_SIZE + this.data.artist.followers_count * 0.0005);
    }

    constructor(manager: SoundcloudGraphManager, data: SoundcloudNodeData){

        super(manager, data);

        const {artist, track} = data;

        this.vel.addV( new Vec2( Math.random() * 2 - 1, Math.random() * 2 - 1 ).scaleBy(20) );
        this.pos = new Vec2( Math.random() * 2 - 1, Math.random() * 2 - 1 ).scaleBy(100);

        (this.html.querySelector(".text-outline")! as HTMLDivElement).innerText = artist.username;
        this.html.style.backgroundImage = `url(${artist.avatar_url}), url(${base}/assets/soundcloud/missing.png)`;

        this.html.style.setProperty('--scale', `${this.diameter / BASE_NODE_SIZE}`);

        (this.html as any).__data_for_fellow_devs_using_inspect_element__ = this.data; // :)

        let textMain = this.html.querySelector(".text-main")! as HTMLDivElement;
        textMain.innerText = artist.username;

        this.html.addEventListener('click', () => {
            if( this.manager.cancelUrlOpen ) return;
            window.open(artist.permalink_url, '_blank', 'noopener, noreferrer');
        });

        this.html.addEventListener('mouseenter', () => {
            this._isHovered = true;
            this.manager.setFocusedNode(this);
        });

        this.html.addEventListener('mouseleave', () => {
            this._isHovered = false;
            this.manager.setFocusedNode(null);
        });
        
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
        this._edgeWidth = clamp(this._edgeWidth + EDGE_RATE * (this._isHovered ? 1 : -1), 0, 1);
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
        const center = this.manager.focusOffset;
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

    public cancelUrlOpen: boolean = false;

    private focusedNode: SoundcloudNode | null = null;
    private focusedOffset: Vec2 = new Vec2(0, 0);

    public setFocusedNode(node: SoundcloudNode | null){
        if( !node && this.focusedNode )
            this.focusedOffset.subV(this.focusedNode!.pos.copy);

        this.focusedNode = node;
        
        if( node )
            this.focusedOffset.addV(node.pos.copy);
    }
    
    public get focusOffset(): ImmutableVec2 {
        const pos = this.focusedNode?.pos ?? Vec2.ZERO;
        return pos.copy.subV(this.focusedOffset);
    }

    private autoFocus = () => {
        window.requestAnimationFrame(this.autoFocus);
        if( !this.focusedNode ) return;
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


    public override get fragmentShader(): string {
        return `#version 300 es

        precision highp float;

        in vec4 v_color;
        in vec3 v_barycentric;

        out vec4 outColor;

        void main() {
            float dist = v_barycentric.x;
            outColor = vec4(dist, dist, dist, 1.0);
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
            this.cancelUrlOpen = true;
        });

        this.nodeContainer.addEventListener('mouseup', () => {
            setTimeout(() => {
                this.cancelUrlOpen = false;
            });
        })

        this.panzoom!.zoomAbs(this.nodeContainer.clientWidth / 2, this.nodeContainer.clientHeight / 2, 4);

        window.setTimeout(() => {
            this.panzoom!.smoothZoomAbs(this.nodeContainer.clientWidth / 2, this.nodeContainer.clientHeight / 2, 0.35);
        }, 1000);

        window.requestAnimationFrame(this.autoFocus);

        // draw brighter edges (bidirectional followings) on top
        this.gl_ctx.enable(this.gl_ctx.BLEND);
        this.gl_ctx.blendFunc(this.gl_ctx.ONE, this.gl_ctx.ONE);
        this.gl_ctx.blendEquation(this.gl_ctx.MAX);
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