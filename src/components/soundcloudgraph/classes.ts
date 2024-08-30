import { clamp, Color, Vec2 } from "$lib/utils";
import { PanZoomOptions } from "panzoom";
import { GraphEdge, GraphManager, GraphNode } from "../graph/classes";

import type { SoundcloudEdgeData, SoundcloudGraphDataset, SoundcloudNodeData } from "$lib/soundcloud/types/native";


export class SoundcloudEdge extends GraphEdge<SoundcloudNodeData, SoundcloudEdgeData, SoundcloudNode> {

    public width: number = 3;

    public static readonly WHITE = new Color(1,1,1);
    public color = SoundcloudEdge.WHITE;

    constructor(private manager: SoundcloudGraphManager, data: SoundcloudEdgeData){
        super(manager, data);
    }

    public override get verts(): Vec2[] {
        const size = this.manager.selfComputedSize;
        const x = size.width * 0.5;
        const y = size.height * 0.5;
        const original = super.verts;
        for( let vert of original ){
            vert.x += x;
            vert.y += y;
        }
        return original;
    }

    public doForces() {
        const childNode  = this.from!;
        const parentNode = this.to!;
        const dist = childNode.pos.distance(parentNode.pos) + 0.1;
        const nx = (parentNode.pos.x-childNode.pos.x)/dist;
        const ny = (parentNode.pos.y-childNode.pos.y)/dist;
        const fac = clamp( dist - 64.0, -32.0, 32.0 ) * 0.05;
        childNode.applyForce(nx*fac,ny*fac);
        parentNode.applyForce(-nx*fac,-ny*fac);   
    }

    public getSerialized(): SoundcloudEdgeData {
        return {
            from: this.from.id,
            to:   this.to.id,
        }
    }

}


export class SoundcloudNode extends GraphNode<SoundcloudNodeData, SoundcloudEdgeData, SoundcloudEdge> {

    declare readonly manager: SoundcloudGraphManager;

    private data: SoundcloudNodeData;

    private homePos?: Vec2;

    public root: boolean;

    constructor(manager: SoundcloudGraphManager, data: SoundcloudNodeData){
        super(manager, data);
        this.data = data;

        this.root = data.root ?? false;

        this.vel.addV( new Vec2( Math.random() * 2 - 1, Math.random() * 2 - 1 ).scaleBy(20) );

        if( data.x !== undefined && data.y !== undefined ){ // do we have a home?
            this.homePos = new Vec2(data.x, data.y);
        }

        (this.html.querySelector(".artist")! as HTMLDivElement).innerText = data.username;
    }

    // abstract implementations
    public override setPos(x: number, y: number): void {
        this.pos.setTo(x, y);
    }

    private doRepulsionForce(that: SoundcloudNode) {
        const dist = this.pos.distance(that.pos)+0.1; // todo: don't compute this twice since we may find it in the above func
        let repulmul = 1.0

        const nx = (that.pos.x-this.pos.x)/dist;
        const ny = (that.pos.y-this.pos.y)/dist;
        const fac = clamp((dist - 200.0)*0.03,-2,0) * repulmul;
        this.applyForce(nx*fac,ny*fac);
        that.applyForce(-nx*fac,-ny*fac);
    }

    private doCenterSeekingForce(){

    }

    public override doPositioning(){
        this.vel.scaleBy(0.8)
        this.pos.addV(this.vel);
    }

    public doForces(){ 
        for( const that of this.manager.nodes.values() ){
            if( that === this ) continue; // don't repel self lol
            this.doRepulsionForce(that);
        }
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