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

const EDGE_MIN_LENGTH             = 2;     // to avoid NaN if nodes are very close
const AMBIENT_REPEL_STRENGTH      = 40000; // inverse square multiplier
const FAR_AWAY_FROM_CENTER_THRESH = 800;  // min "far" distance

const EDGE_RATE                   = 0.1;

export class SoundcloudEdge extends GraphEdge<SoundcloudNodeData, SoundcloudEdgeData, SoundcloudNode> {

    public get width() {
        return max(this.to.edgeWidth, this.from.edgeWidth) * 3;
    }

    public static readonly WHITE = new Color(1, 1, 1);
    public static readonly GRAY  = new Color(0.5, 0.5, 0.5);
    public get color() {
        return this.bidirectional ? SoundcloudEdge.WHITE : SoundcloudEdge.GRAY;
    }

    constructor(private manager: SoundcloudGraphManager, data: SoundcloudEdgeData){
        super(manager, data);
    }

    public override get verts(): Vec2[] {

        if( this.width === 0 ) return [];

        let original: Vec2[];

        if( this.bidirectional ){
            original = super.verts;
        }
        else { // arrows
            const to   = this.to.pos;
            const from = this.from.pos;

            const norm = this.normal;
            norm.scaleBy(this.width / 2);
    
            const offset = norm.copy;
            offset.pivot90CCW();

            original = [
                from.copy.addV(offset),
                from.copy.subV(offset),
                to.copy
            ]
        }

        const size = this.manager.selfComputedSize;
        const x = size.width * 0.5;
        const y = size.height * 0.5;
        for( let vert of original ){
            vert.x += x;
            vert.y += y;
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
        const childNode  = this.from!;
        const parentNode = this.to!;

        const dist = childNode.pos.distance(parentNode.pos);
        let factor = clamp(dist * 0.05, 0, 1) * (this.bidirectional ? 2 : 1);
        const dir  = childNode.pos.copy.subV(parentNode.pos).scaleBy(factor * (1 + this.width * 2) / dist);

        this.from!.vel.subV(dir);
        this.to!.vel.addV(dir);
    }

}


export class SoundcloudNode extends GraphNode<SoundcloudNodeData, SoundcloudEdgeData, SoundcloudEdge> {

    declare readonly manager: SoundcloudGraphManager;

    private _edgeWidth: number = 0;
    private _isHovered: boolean = false;
    public get edgeWidth() {
        return this._edgeWidth;
    }

    constructor(manager: SoundcloudGraphManager, data: SoundcloudNodeData){

        super(manager, data);

        this.vel.addV( new Vec2( Math.random() * 2 - 1, Math.random() * 2 - 1 ).scaleBy(20) );
        this.pos = new Vec2( Math.random() * 2 - 1, Math.random() * 2 - 1 ).scaleBy(100);

        (this.html.querySelector(".text-outline")! as HTMLDivElement).innerText = data.username;
        this.html.style.backgroundImage = `url(${data.avatar_url}), url(${base}/assets/soundcloud/missing.png)`;

        let textMain = this.html.querySelector(".text-main")! as HTMLDivElement;
        textMain.innerText = data.username;

        this.html.addEventListener('click', () => {
            if( this.manager.cancelUrlOpen ) return;
            window.open(data.permalink_url, '_blank', 'noopener, noreferrer');
        });

        this.html.addEventListener('mouseenter', () => {
            this._isHovered = true;
        });

        this.html.addEventListener('mouseleave', () => {
            this._isHovered = false;
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

    private doRepulsionForce(that: SoundcloudNode) {
        let dist = this.pos.distance(that.pos) + EDGE_MIN_LENGTH;

        const f = this.pos.copy.subV(that.pos).scaleBy( 
            (-AMBIENT_REPEL_STRENGTH / (dist**3))
        )

        that.vel.addV(f);
        this.vel.subV(f);
    }

    private doCenterSeekingForce(){
        const len = this.pos.length();
        const scale = clamp(len - FAR_AWAY_FROM_CENTER_THRESH, 0, Infinity) / len;
        this.vel.addV( this.pos.copy.scaleBy(scale * -0.1) );
    }

    public override doPositioning(){
        this._edgeWidth = clamp(this._edgeWidth + EDGE_RATE * (this._isHovered ? 1 : -1), 0, 1);
        let stillness = Math.pow(2, this._edgeWidth * 10);
        this.vel.scaleBy(0.4 * (1 / stillness));
        this.pos.addV(this.vel);
    }

    public doForces(){ 
        for( const that of this.manager.nodes.values() ){
            if( that === this ) continue; // don't repel self lol
            this.doRepulsionForce(that);
        }
        this.doCenterSeekingForce();
    }

    public getSerialized(): SoundcloudNodeData {
        return {
            ...this.data,
            x: this.pos.x / this.manager.nodeContainer.clientWidth,
            y: this.pos.y / this.manager.nodeContainer.clientHeight,
        }
    }

    public override render(){
        const size = this.manager.selfComputedSize;
        this.style.transform = `
        translate(
            ${this.pos.x + size.width / 2}px, 
            ${this.pos.y + size.height / 2}px
        ) 
        translate(-50%, -50%)
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

        this.panzoom!.on('panend', () => {
            setTimeout(() => {
                this.cancelUrlOpen = false;
            }, 0);
        });

        this.panzoom!.zoomAbs(this.nodeContainer.clientWidth / 2, this.nodeContainer.clientHeight / 2, 4);

        window.setTimeout(() => {
            this.panzoom!.smoothZoomAbs(this.nodeContainer.clientWidth / 2, this.nodeContainer.clientHeight / 2, 0.35);
        }, 1000);

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
        
        const json = JSON.stringify({ nodes, edges }, undefined, 4);

        let element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(json));
            element.setAttribute('download', 'graph_soundcloud.json');
          
            element.style.display = 'none';
            document.body.appendChild(element);
          
            element.click();
        document.body.removeChild(element);
    }
    

}