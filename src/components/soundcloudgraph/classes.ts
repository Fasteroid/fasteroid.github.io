

import type { SoundcloudEdgeData, SoundcloudGraphDataset, SoundcloudNodeData } from "$lib/soundcloud/types_native";
import { base } from "$app/paths";
import { Vec2 } from "$lib/vec2";
import type { ImmutableVec2 } from "$lib/vec2"
import { addHyperlinks } from "./url-adder";
import { getEnhancedBio, trimBioText } from "./bio-enhancements";

import "./widget-types"; // cursed hack by Claude
import { GraphEdge2, GraphManager2, GraphNode2 } from "../graph/GraphManager2";
import { Color } from "$lib/utils";
import { getPalette } from "colorthief";
import { LIKES_SIZE_MUL, FAVORITES_SIZE_MUL, RELICS_SIZE_MUL } from "./constants";

const sqrt = Math.sqrt
const max = Math.max
const min = Math.min

const REPEL_SOFTNESS              = 2;    // to avoid NaN if nodes are very close
const AMBIENT_REPEL_STRENGTH      = 100; // inverse square multiplier
const FAR_AWAY_FROM_CENTER_THRESH = 1700; // min "far" distance

const THINNING_FACTOR             = 30;   // controls triangle overlap on bidirectional edges

const EDGE_RATE                   = 0.1;  // how quickly the edges grow and shrink

const BASE_NODE_SIZE              = 48;   // self-explanatory

const UNFOCUS_DRAG_DIST           = 50;  // how far to drag before unfocusing; allows micro-movements during selection

const NODE_SUPER_RESOLUTION       = 4;

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
        return max(this.target.edgeWidth, this.source.edgeWidth) * 3;
    }

    public readonly color: Color = Color.BLACK;
    constructor(
        public readonly source: SoundcloudNode,
        public readonly target: SoundcloudNode,
        data: SoundcloudEdgeData
    ){
        super();
        // this.bidirectional = data.bidirectional;
    }

    private $lastToPalette: Color[] = [];
    private $lastFromPalette: Color[] = [];

    private toColor:   Color = Color.BLACK;
    private fromColor: Color = Color.BLACK;

    public getSerialized(): SoundcloudEdgeData {
        return {
            from: this.source.data.id,
            to:   this.target.data.id,
        }
    }

}


export class SoundcloudNode extends GraphNode2 {

    declare readonly edges:   SoundcloudEdge[];

    private _focused:  boolean = false;
    private _selected: boolean = false;

    private _edgeWidth: number = 0;
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

    private _descriptor!: HTMLElement;
    public get descriptor(): HTMLElement {
        return this._descriptor ?? ( // Are getters like this an anti-pattern, or are they based?  I'm doing this a lot...
            this._descriptor = this.html.querySelector('.descriptor') as HTMLElement
        )
    }

    public playNextNode() {
        const TARGET_ZOOM = 1.5;

        const choices = getShuffledCopy(this.neighbors); // random walk to the next track
        const choice  = choices.find( (choice) => !this.manager.walked.has(choice) );

        throw new Error("todo");
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
    }

    /** When it's done fading in */
    private onFullVisible() {
        this.html.classList.remove('anim-middle');
        this.html.classList.add('anim-top');
    }

    /** When it's done fading out */
    private onLastVisible() {
        this.html.classList.remove('anim-middle');
        this.descriptor.hidden = true;
    }

    private anim?: Animation;
    private anim2?: Animation;
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

    private onClick = () => {
        if( this.manager.dragging ) {
            this.manager.setFocusedNode(null)
            return;
        };
        if( this._focused ) {
            window.open(this.data.artist.permalink_url, '_blank');
            this.manager.preventUnfocus_ = true;
            return;
        }
        this.manager.walked.clear();
        this.manager.walked.add(this);
        
        this.manager.setFocusedNode(this);
        this.manager.setSelectedNode(this);
    }

    constructor(
        public readonly manager: SoundcloudGraphManager, 
        public readonly data: Readonly<SoundcloudNodeData>
    ){

        super(manager as unknown as GraphManager2<GraphNode2, GraphEdge2>);

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

        img.addEventListener('click', this.onClick);
        img.addEventListener('touchend', this.onClick);

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

    public override render(){
        const center = {x: 0, y: 0}
        const size   = this.manager.selfComputedSize;

        this.html.style.transform = `
        translate(
            ${this.x - center.x + size.width / 2}px, 
            ${this.y - center.y + size.height / 2}px
        ) 
        `;
    }
    
}

export class SoundcloudGraphManager extends GraphManager2<
    SoundcloudNode,
    SoundcloudEdge,
    SoundcloudNodeData,
    SoundcloudEdgeData
> {

    protected get frametime(){
        return 30;
    }

    public  held:          boolean = false;
    public  dragging:      boolean = false;
    private focusChanged:  boolean = false;

    public  preventUnfocus_: boolean = false;

    private focusedNode:  SoundcloudNode | null = null;
    private selectedNode: SoundcloudNode | null = null;
    // private firstDragTransform: Transform | null = null;

    public readonly walked = new Set<SoundcloudNode>();

    public readonly templateEmbed: HTMLIFrameElement;

    public setSelectedNode(node: SoundcloudNode | null){
        if( node === this.selectedNode ) return;
        this.selectedNode?.setSelect(false);
        this.selectedNode = node;
        node?.setSelect(true);
    }

    public setFocusedNode(node: SoundcloudNode | null){

        if( node === this.focusedNode ) return;
        
        (window as any).focusedNode = node;

        throw new Error("todo");

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
        (window as any).manager = this;
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


        // this.panzoom!.on('pan', () => {
        //     if( !this.held ) return;
        //     this.firstDragTransform ??= this.getPanzoomTransform();
        //     let curDragTransform = this.panzoom!.getTransform();

        //     if( sqrt(
        //         ( this.firstDragTransform.x - curDragTransform.x ) ** 2 +
        //         ( this.firstDragTransform.y - curDragTransform.y ) ** 2
        //     ) > UNFOCUS_DRAG_DIST ) {
        //         this.dragging = true;
        //         this.setFocusedNode(null);
        //     }
        // });

        const wheel = (e: WheelEvent) => {
            this.setFocusedNode(null);
        }

        this.edgeContainer.addEventListener('wheel', wheel)
        this.nodeContainer.addEventListener('wheel', wheel)

        const mouseUp = () => {
            setTimeout(() => {
                if( !this.focusChanged && !this.preventUnfocus_ ){  // preventUnfocus triggers when opening a link by clicking a node again
                    this.setFocusedNode(null);
                    if( !this.dragging ) this.setSelectedNode(null);
                }
                this.preventUnfocus_    = false;
                this.held               = false;
                this.dragging           = false;
                this.focusChanged       = false;
                // this.firstDragTransform = null;
            })
        };

        this.nodeContainer.addEventListener('mouseup', mouseUp);
        this.edgeContainer.addEventListener('mouseup', mouseUp);

        this.nodeContainer.addEventListener('touchend', mouseUp);
        this.edgeContainer.addEventListener('touchend', mouseUp);

        const mouseDown = () => {
            this.held         = true;
            this.dragging     = false;
            this.focusChanged = false;
        };

        this.nodeContainer.addEventListener('mousedown', mouseDown);
        this.edgeContainer.addEventListener('mousedown', mouseDown);

        this.edgeContainer.addEventListener('touchstart', mouseDown);
        this.nodeContainer.addEventListener('touchstart', mouseDown);

        // this.panzoom!.zoomAbs(this.nodeContainer.clientWidth / 2, this.nodeContainer.clientHeight / 2, 0.35);

        // window.setTimeout(() => {
        //     this.panzoom!.smoothZoomAbs(this.nodeContainer.clientWidth / 2, this.nodeContainer.clientHeight / 2, 0.35);
        // }, 1000);

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