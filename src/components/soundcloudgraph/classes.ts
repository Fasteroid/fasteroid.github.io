

import type { SoundcloudEdgeData, SoundcloudGraphDataset, SoundcloudNodeData } from "$lib/soundcloud/types_native";
import { base } from "$app/paths";
import { addHyperlinks } from "./url-adder";
import { getEnhancedBio, trimBioText } from "./bio-enhancements";

import "./widget-types"; // cursed hack by Claude
import { GraphEdge2, GraphManager2, GraphNode2 } from "../graph/GraphManager2";
import { chooseRandomly, clamp, Color, lerp, makeHarmonicOscillator, nextMicrotask } from "$lib/utils";
import { getPalette } from "colorthief";
import { LIKES_SIZE_MUL, FAVORITES_SIZE_MUL, RELICS_SIZE_MUL } from "./constants";
import * as d3 from "d3";
import type { Panzoom } from "@fasteroid/panzoom-revamped";
import type { PanzoomTransform } from "@fasteroid/panzoom-revamped/transform";
import { WebGLUtils } from "$lib/webgl/utils";

import EDGE_FRAG_SHADER from './edges.frag.glsl?raw';
import EDGE_VERT_SHADER from './edges.vert.glsl?raw';

const max = Math.max
const min = Math.min

const BASE_NODE_SIZE        = 48;   // self-explanatory
const UNFOCUS_DRAG_DIST     = 50;  // how far to drag before unfocusing; allows micro-movements during selection
const NODE_SUPER_RESOLUTION = 4;
const FOCUS_TIME            = 90; // how long it takes to fully focus on a node, in "frames" (60 frames = 1 second)

const HOVER_EDGE_THICKNESS = 1.5;
const SELECT_EDGE_THICKNESS = 12;
const SELECT_EDGE_RATE = 0.5;

const EDGE_VERTS = new Float32Array([
    1, 0, 
    0, -0.5,
    0, 0.5,
    
    0, 0,
    1, -0.5,
    1, 0.5
])


// technically this easing isn't physically accurate, but to do what I actually want I'd need to implement RK4 and tune a fuckton of parameters.  Close enough.
const OSCILLATOR = makeHarmonicOscillator(0.65, 30);
const EASE_FN = (t: number) => OSCILLATOR(t ** 1.5);

function getZoomScaleMul(){
    return document.body.clientWidth * 0.065
}

function orderByMostNeighbors(a: SoundcloudNode, b: SoundcloudNode){
    return b.neighbors.length - a.neighbors.length 
}

/**
 * @stackoverflow https://stackoverflow.com/a/12646864/15204995
 */
function getShuffledCopy<T>(array: T[]) {
    array = [...array];
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export class SoundcloudEdge extends GraphEdge2 {

    public get width() {
        return max( this.source.edgeWidth, this.target.edgeWidth )
    }

    public get stress() {
        return ( this.source.x - this.target.x ) ** 2 + ( this.source.y - this.target.y ) ** 2
    }

    constructor(
        public readonly source: SoundcloudNode,
        public readonly target: SoundcloudNode,
        _: SoundcloudEdgeData
    ){
        super();
    }

    private _targetColor?: Color;
    private _sourceColor?: Color;


    public get targetColor() {
        if( this._targetColor ) return this._targetColor;

        if( !this.bidirectional ) {
            return this._targetColor = Color.BLACK;
        }

        if( this.target.palette ) {
            this._targetColor = chooseRandomly(this.target.palette) ?? Color.BLACK;
            return this._targetColor;
        }

        return Color.BLACK;
    }

    public get sourceColor() {
        if( this._sourceColor ) return this._sourceColor;

        if( this.source.palette ) {
            this._sourceColor = chooseRandomly(this.source.palette) ?? Color.BLACK;
            return this._sourceColor;
        }

        return Color.BLACK;
    }

    public getSerialized(): SoundcloudEdgeData {
        return {
            from: this.source.data.id,
            to:   this.target.data.id,
        }
    }

    public *getRawData(): Generator<number, void, unknown> {
        yield this.source.x;
        yield this.source.y;
        yield this.target.x;
        yield this.target.y;
        yield this.width;
        yield this.sourceColor.r;
        yield this.sourceColor.g;
        yield this.sourceColor.b;
        yield this.targetColor.r;
        yield this.targetColor.g;
        yield this.targetColor.b;
    }

}


export class SoundcloudNode extends GraphNode2 {

    declare readonly edges:   SoundcloudEdge[];

    private _focused:  boolean = false;
    private _selected: boolean = false;

    private _selectEdgeWidth:      number = 0;
    public get edgeWidth() {
        return this._selectEdgeWidth;
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
        return this._trueDiameter ??= max(this.diameter, BASE_NODE_SIZE + Math.sqrt(this.data.artist.followers_count) * 0.5 );
    }

    private _palette?: Color[];
    public get palette(): Color[] | undefined {
        return this._palette;
    }

    private _descriptor!: HTMLElement;
    public get descriptor(): HTMLElement {
        return this._descriptor ?? ( // Are getters like this an anti-pattern, or are they based?  I'm doing this a lot...
            this._descriptor = this.html.querySelector('.descriptor') as HTMLElement
        )
    }

    public playNextNode() {
        const choices = getShuffledCopy(this.neighbors); // random walk to the next track
        const choice  = choices.find( (choice) => !this.manager.walked.has(choice) );

        this.manager.setFocusedNode( choice ?? choices[0] ?? null ); // if there are no neighbors, just unfocus
    }


    /** When it starts fading in */
    private onFirstVisible() {
        this.descriptor.hidden = false;
        
        const placeholder = this.html.querySelector('.iframe-placeholder') as HTMLElement | null;
        if( !placeholder || !this.data.track ) return;

        const iframe = this.manager.templateEmbed.cloneNode(true) as HTMLIFrameElement
        iframe.src = `https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${this.data.track.id}&color=%23ff5500&inverse=true&auto_play=true&show_user=true`
        iframe.hidden = false;
        placeholder.replaceWith(iframe);

        let widget = window.SC.Widget(iframe);
        widget.bind(
            window.SC.Widget.Events.READY, 
            () => {
                widget.setVolume(40);
            }
        );

        // randomly walk the graph
        widget.bind(
            window.SC.Widget.Events.FINISH,
            this.playNextNode.bind(this)
        )

        // DEBUG
        // setTimeout( () => this.playNextNode(), 3000 )
            
    }

    /** When it's done fading in */
    private onFullVisible() {
        this.html.classList.remove('anim-middle');
        this.html.classList.add('anim-top');

        this.html.hidden = true;
        this.html.hidden = false;
    }

    /** When it's done fading out */
    private onLastVisible() {
        this.html.classList.remove('anim-middle');
        this.descriptor.hidden = true;
    }

    private anim?: Animation;
    /**
     * Shows / hides soundcloud overlay
     */
    public setFocus(is: boolean){
        this._focused = is;

        if( this.anim ){ 
            this.anim.onfinish = () => {}; // cancel but don't really cancel 
        }

        this.anim = this.descriptor.animate(
            [ 
                { opacity: is ? 1 : 0 } 
            ], 
            {
                duration: 500,
                easing: 'ease-in-out',
                fill: 'both'
            }
        );
        this.html.querySelector(".iframe-holder")?.animate(
            [ 
                { opacity: is ? 1 : 0 } 
            ], 
            {
                duration: 500,
                easing: 'ease-in-out',
                fill: 'both'
            }   
        )

        this.html.classList.remove('anim-top');
        this.html.classList.add('anim-middle');

        if( is ) {
            this.onFirstVisible();
            this.anim.onfinish = this.onFullVisible.bind(this);
        }
        else {
            this.anim.onfinish = this.onLastVisible.bind(this);
        }
    }

    /**
     * Decides if this node should be playing music or not
     */
    public setSelect(is: boolean){
        this._selected = is;

        if( !is ){
            const iframe = this.html.querySelector('iframe') as HTMLIFrameElement | null;
            if( !iframe ) return;
    
            const placeholder = document.createElement('div');
            placeholder.classList.add('iframe-placeholder');
    
            iframe.replaceWith(placeholder); // clean up
        }
    }

    constructor(
        public readonly manager: SoundcloudGraphManager, 
        public readonly data: Readonly<SoundcloudNodeData>
    ){

        super(manager as unknown as GraphManager2<GraphNode2, GraphEdge2>);

        this.x = Math.random() * 1000 - 500;
        this.y = Math.random() * 1000 - 500;

        const {artist, track} = data;

        // this.vel.addV( new Vec2( Math.random() * 2 - 1, Math.random() * 2 - 1 ).scaleBy(20) );
        // this.pos = new Vec2( Math.random() * 2 - 1, Math.random() * 2 - 1 ).scaleBy(100);

        this.html.hidden = false;

        (this.html.querySelector(".text-outline")! as HTMLDivElement).innerText = artist.username;

        // const pixelPerfectDiameter = Math.round( this.diameter * BASE_NODE_SIZE / NODE_SUPER_RESOLUTION ) * NODE_SUPER_RESOLUTION / BASE_NODE_SIZE
        this.html.style.setProperty('--node-scale', `${this.diameter / (BASE_NODE_SIZE * NODE_SUPER_RESOLUTION)}`);

        (this.html.querySelector(".text-main")! as HTMLDivElement).innerText = artist.username;

        // use img instead for pointer events and stuff since its hitbox is actually circular (unlike the div)
        const img = this.html.querySelector("img") as HTMLImageElement;

        img.crossOrigin = "Anonymous";
        img.src = artist.avatar_url ?? `${base}/assets/soundcloud/missing.png`;

        (img as any).__data__ = this.data; // for devs; this will be what gets inspect-elemented

        this.descriptor.hidden = true;
        this.descriptor.style.opacity = '0';

        const text_bio = this.descriptor.querySelector('.text-bio') as HTMLElement;
        text_bio.innerText = trimBioText( getEnhancedBio(data) ?? "", 8, 400 );

        const wrapper = this.descriptor.querySelector('.inside') as HTMLElement;
        
        if( artist.background_art ) wrapper.style.setProperty('--background-art', `url(${artist.background_art})`);

        if( track ) {
            this.descriptor.querySelector('.text-featured-track')!.textContent = `${track.title}`;
        }

        addHyperlinks(text_bio); // make the links clickable; cursed.
        
        img.addEventListener('load', async () => {
            const colors = await getPalette(img, {worker: true, colorCount: 5});
            if( !colors ) return;
            this._palette = colors.map( (color) => {
                // TODO: two color classes? ugly! fix please!
                let actualColor = new Color(...Object.values( color.rgb() ));
                let hsv = actualColor.toHSV();
                hsv.v = max(0.8, hsv.v);
                hsv.s = min(0.6, hsv.s);
                return Color.fromHSV(hsv.h, hsv.s, hsv.v);
            } )
        });
        
    
        const pointerUp = (e: PointerEvent) => { 
            const distance = Math.hypot(e.clientX - this.manager.downEvent.clientX, e.clientY - this.manager.downEvent.clientY);
            if( distance > UNFOCUS_DRAG_DIST ) {
                // we dragged far, probably don't want to click
                return;
            }

            if( this._focused ) {
                window.open(this.data.artist.permalink_url, '_blank');
                return;
            }
            this.manager.walked.clear();
            this.manager.walked.add(this);
            
            this.manager.setFocusedNode(this);
            this.manager.setSelectedNode(this);
        }

        const pointerDown = (e: PointerEvent) => {
            this.manager.downEvent = e;
            e.stopPropagation();
        }

        const cancel = (e: Event) => e.stopPropagation();

        img.addEventListener('pointerup', pointerUp);
        img.addEventListener('pointerdown', pointerDown);

        const desc = this.html.querySelector(".descriptor")!;
        desc.addEventListener('pointerdown', cancel)
        desc.addEventListener('pointerup', cancel)

    }

    private _neighbors!: SoundcloudNode[];

    public get neighbors(): SoundcloudNode[] {
        return this._neighbors ?? (
            this._neighbors = this.edges.map( (edge) => (edge.source === this ? edge.target : edge.source) )
        )
    }

    public getSerialized(): SoundcloudNodeData {
        return {
            ...this.data,
        }
    }

    public isOutsideViewport() {
        const { zoom, x: panX, y: panY } = this.manager.panzoomTransform;
        const { width, height } = this.manager.parentBox;
    
        const lx = this.x * zoom + panX;
        const ly = this.y * zoom + panY;
        const halfW = width / 2;
        const halfH = height / 2;
    
        return (
            lx + this.diameter * 0.5 * this.manager.panzoomTransform.zoom < -halfW ||
            lx - this.diameter * 0.5 * this.manager.panzoomTransform.zoom >  halfW ||
            ly + this.diameter * 0.5 * this.manager.panzoomTransform.zoom < -halfH ||
            ly - this.diameter * 0.5 * this.manager.panzoomTransform.zoom >  halfH
        );
    }

    public override render(){
        this._selectEdgeWidth = clamp( this._selectEdgeWidth + (this._selected ? 1 : -1) * this.manager.dt * SELECT_EDGE_RATE, 0, SELECT_EDGE_THICKNESS)

        const isOutside = this.isOutsideViewport();
        const skipRender = isOutside && this.html.hidden;
        this.html.hidden = isOutside;
    
        if (skipRender) return;
    
        const size   = this.manager.selfComputedSize;
        this.html.style.transform = `translate(${this.x + size.width / 2}px,${this.y + size.height / 2}px)`;
    }
    
}

export class SoundcloudGraphManager extends GraphManager2<
    SoundcloudNode,
    SoundcloudEdge,
    SoundcloudNodeData,
    SoundcloudEdgeData
> {

    declare panzoom: Panzoom;

    private readonly gl: WebGL2RenderingContext;
    private readonly edgeBuffer: WebGLBuffer;
    private readonly resUniform: WebGLUniformLocation;
    private readonly panzoomUniform: WebGLUniformLocation;
    private readonly timeUniform: WebGLUniformLocation;

    protected get frametime(){
        return 30;
    }

    public  downEvent!: PointerEvent;
    public  dragging:   boolean = false;

    private focusTime:  number  = 0;
    /** snapshot of {@linkcode panzoomTransform} last time {@linkcode focusTime} was 0 */
    private focusStart: PanzoomTransform | null = null;

    private focusedNode:  SoundcloudNode | null = null;
    private selectedNode: SoundcloudNode | null = null;

    private _panzoomTransform: PanzoomTransform = {x: 0, y: 0, zoom: 1};
    public get panzoomTransform() {
        return this._panzoomTransform as Readonly<PanzoomTransform>;
    }
    // private firstDragTransform: Transform | null = null;

    public readonly walked = new Set<SoundcloudNode>();

    public readonly templateEmbed: HTMLIFrameElement;

    /**
     * Sets the node as selected and notes it on the {@link SoundcloudGraphManager | manager}
     */
    public setSelectedNode(node: SoundcloudNode | null){
        // Debug.logFancy("node", node, "selected")
        if( node === this.selectedNode ) return;
        this.selectedNode?.setSelect(false);
        this.selectedNode = node;
        node?.setSelect(true);
    }

    /**
     * Selects a node and moves the panzoom
     */
    public setFocusedNode(node: SoundcloudNode | null){
        if( node === this.focusedNode ) return;
        // Debug.logFancy("node", node, "focused")

        this.focusedNode?.setFocus(false);
        
        this.focusedNode = node;
        this.focusTime = 0;
        this.focusStart = { ...this.panzoomTransform };

        if( node ){
            node.setFocus(true);
            this.setSelectedNode(node);
        }
    }

    constructor(
        templateNode: HTMLElement, 
        nodeContainer: HTMLElement, 
        lineContainer: HTMLCanvasElement,
        data: SoundcloudGraphDataset
    ){
        super(
            templateNode, 
            nodeContainer, 
            lineContainer, 
            function(this: SoundcloudGraphManager, edgeData) {
                return new SoundcloudEdge( this.nodes.get(edgeData.from)!, this.nodes.get(edgeData.to)!, edgeData );
            },
            function(this: SoundcloudGraphManager, nodeData) {
                return new SoundcloudNode(this, nodeData);
            },
            data,
            true
        );

        this.panzoom.onTransformChanged( (transform) => {
            this._panzoomTransform = transform;
        } );

        this.simulation.force('center', d3.forceCenter(0, 0) );
        this.simulation.force('charge', d3.forceManyBody<SoundcloudNode>().strength( (d: SoundcloudNode) => -60 * d.trueDiameter ) );
        this.simulation.force('collision', d3.forceCollide<SoundcloudNode>().radius( (d: SoundcloudNode) => d.diameter * 0.25 ).strength(0.4).iterations(4) );
        this.simulation.force("x", d3.forceX().strength(0.5))
        this.simulation.force("y", d3.forceY().strength(0.5))

        this.linkForces.strength(0.02).distance(0).iterations(5)

        this.simulation.velocityDecay(0.8);
        this.simulation.alpha(0.08);
        this.simulation.alphaDecay(0);


        this.handleResize();

        this.templateEmbed = document.getElementById('template-embed') as HTMLIFrameElement;

        const urlLookupMap = new Map<string, SoundcloudNode>();

        this.nodeContainer.style.setProperty('--base-scale', `${BASE_NODE_SIZE * NODE_SUPER_RESOLUTION}px`);

        this.nodes.forEach( node => {
            urlLookupMap.set(node.data.artist.permalink_url, node);
        });

        this.nodes.forEach( node => {
            node.descriptor.querySelectorAll('a').forEach( (a: HTMLAnchorElement) => {
                let related = urlLookupMap.get(a.href);
                if( related ){
                    let replacement = document.createElement('span');
                    replacement.innerText = a.innerText;
                    replacement.classList.add("a");
                    replacement.addEventListener('click', () => { related.html.querySelector('img')?.click() });

                    a.replaceWith(replacement);
                }
            })
        });

        const wheel = (e: WheelEvent) => {
            this.setFocusedNode(null);
        }

        const pointerUp = async (e: PointerEvent) => {
            const distance = Math.hypot(e.clientX - this.downEvent.clientX, e.clientY - this.downEvent.clientY);
            // Debug.logFancy("root pointerUp", 1, e.type)
            if( 
                this.dragging && 
                distance < UNFOCUS_DRAG_DIST &&
                !(this.downEvent.target as HTMLElement).closest(".node")
            ) {
                // we didn't drag far and didn't click a node to begin with... user probably wants to deselect
                this.setSelectedNode(null);
            }

            this.dragging = false;
        };

        const pointerDown = (e: PointerEvent) => {
            // Debug.logFancy("root pointerDown", 1, e.type)
            this.downEvent = e;
            this.setFocusedNode(null);
            this.dragging = true;
        };

        this.edgeContainer.addEventListener('wheel', wheel)
        this.nodeContainer.addEventListener('wheel', wheel)

        this.nodeContainer.addEventListener('pointerup', pointerUp);
        this.edgeContainer.addEventListener('pointerup', pointerUp);

        this.nodeContainer.addEventListener('pointerdown', pointerDown);
        this.edgeContainer.addEventListener('pointerdown', pointerDown);

        // webgl!
        {
            const gl = this.edgeContainer.getContext("webgl2");
            if( !gl ) throw new Error("WebGL2 not supported!");
            this.gl = gl;

            const program = WebGLUtils.createProgram(
                gl, 
                EDGE_FRAG_SHADER, 
                EDGE_VERT_SHADER
            );

            gl.useProgram(program);

            this.resUniform     = gl.getUniformLocation(program, 'u_resolution')!;
            this.panzoomUniform = gl.getUniformLocation(program, 'u_panzoom')!;
            this.timeUniform    = gl.getUniformLocation(program, 'u_time')!;

            const templateBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, templateBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, EDGE_VERTS, gl.STATIC_DRAW);

            const a_templatePosition = gl.getAttribLocation(program, 'a_templatePosition');
            gl.enableVertexAttribArray(a_templatePosition);
            gl.vertexAttribPointer(a_templatePosition, 2, gl.FLOAT, false, 0, 0);

            const edgeBuffer = this.edgeBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, edgeBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( this.edges.size * this.getRawEdgeSize ), gl.DYNAMIC_DRAW);

            WebGLUtils.setupInstanceAttributes(gl, program, [
                ['a_startPoint', 2, gl.FLOAT],
                ['a_endPoint',   2, gl.FLOAT],
                ['a_width',      1, gl.FLOAT],
                ['a_startcolor', 3, gl.FLOAT],
                ['a_endcolor',   3, gl.FLOAT],
            ])

            const onCanvasResized = () => {
                const dpr = window.devicePixelRatio || 1;
                const displayWidth = this.edgeContainer.clientWidth;
                const displayHeight = this.edgeContainer.clientHeight;
                
                // Set actual canvas resolution
                this.edgeContainer.width = displayWidth * dpr;
                this.edgeContainer.height = displayHeight * dpr;
        
                this.gl.viewport(0, 0, this.edgeContainer.width, this.edgeContainer.height);
                this.gl.uniform2f(this.resUniform, this.edgeContainer.width, this.edgeContainer.height);
        
                this.render(); // immediately rerender
            }

            const canvasResizeWatcher = new ResizeObserver(onCanvasResized);
            canvasResizeWatcher.observe(this.edgeContainer);

            const onPanzoomChanged = () => {
                this.gl.uniform3f(this.panzoomUniform, this.panzoomTransform.x, this.panzoomTransform.y, this.panzoomTransform.zoom);
                this.renderWebGL();
            }

            this.panzoom.onTransformChanged(onPanzoomChanged)
            onPanzoomChanged();

        }

    }



    private *getRawEdgeData(): Generator<number, void, unknown> {
        for( const edge of this.edges.values() ){
            if( edge.width === 0 ) continue; // skip invisible edges
            yield* edge.getRawData();
        }
    }

    private _rawEdgeSize?: number;
    public get getRawEdgeSize(): number {
        return this._rawEdgeSize ??= this.edges.values()
            .next().value!
            .getRawData().reduce( (sum) => sum + 1, 0 );
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

    private renderWebGL() {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.edgeBuffer);
        const edgeData = new Float32Array( this.getRawEdgeData() );
        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, edgeData);
        
        this.gl.clearColor(0, 0, 0, 0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE);
        this.gl.drawArraysInstanced(this.gl.TRIANGLES, 0, EDGE_VERTS.length / 2, edgeData.length / this.getRawEdgeSize);
    }

    public override render(): void { 
        this.focusTime = Math.min(this.focusTime + this.dt, FOCUS_TIME);

        this.gl.uniform1f(this.timeUniform, performance.now() / 1000);

        if( this.focusedNode ){
            const node = this.focusedNode;

            const t = this.focusTime / FOCUS_TIME;
            const curved_t = EASE_FN(t);
    
            const targetZoom = 4 * getZoomScaleMul() / node.diameter;
            const targetX = -node.x * targetZoom - this.parentBox.width * 0.15;
            const targetY = -node.y * targetZoom;
    
            this.panzoom.editTransform((transform) => {
                transform.zoom = lerp(this.focusStart!.zoom, targetZoom, curved_t);
                transform.x    = lerp(this.focusStart!.x, targetX, curved_t);
                transform.y    = lerp(this.focusStart!.y, targetY, curved_t);
            });
        } 

        super.render();
        this.renderWebGL();
    }
    
    private offsetPos_buffer: [number, number] = [0, 0];
    public get offsetPos(): [number, number] {
        if( !this.focusedNode ) {
            this.offsetPos_buffer[0] = 0;
            this.offsetPos_buffer[1] = 0;
        }
        else {
            this.offsetPos_buffer[0] = this.focusedNode.x;
            this.offsetPos_buffer[1] = this.focusedNode.y;
        }
        return this.offsetPos_buffer;
    }

    private simToDoc_buffer: [number, number] = [0, 0];
    public simToDoc(x: number, y: number) {
        x *= this._panzoomTransform.zoom;
        y *= this._panzoomTransform.zoom;
        x += this._panzoomTransform.x;
        y += this._panzoomTransform.y;
        x += this.parentBox.x + this.parentBox.width / 2;
        y += this.parentBox.y + this.parentBox.height / 2;
        this.simToDoc_buffer[0] = x;
        this.simToDoc_buffer[1] = y;
        return this.simToDoc_buffer;
    }
    

    private docToChild_buffer: [number, number] = [0, 0];
    public docToChild(x: number, y: number) {
        const bounds = this.parentBox;
        this.docToChild_buffer[0] = x - bounds.x - bounds.width / 2 - this._panzoomTransform.x;
        this.docToChild_buffer[1] = y - bounds.y - bounds.height / 2 - this._panzoomTransform.y;
        return this.docToChild_buffer;
    }

    private simToChild_buffer: [number, number] = [0, 0];
    public simToChild(x: number, y: number) {
        x = x * this._panzoomTransform.zoom;
        y = y * this._panzoomTransform.zoom;
        this.simToChild_buffer[0] = x;
        this.simToChild_buffer[1] = y;
        return this.simToChild_buffer;
    }


}


