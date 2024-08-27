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

    public doForces() {
        const childNode  = this.from!;
        const parentNode = this.to!;
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

    private homePos?: Vec2;
    private data: SoundcloudNodeData;

    constructor(manager: SoundcloudGraphManager, data: SoundcloudNodeData){
        super(manager, data);
        this.data = data;

        this.applyForce( Math.random() - 0.5, Math.random() - 0.5 );
        this.setPos( manager.nodeContainer.clientWidth * 0.5, manager.nodeContainer.clientHeight * 0.5 );

        if( data.x !== undefined && data.y !== undefined ){ // do we have a home?
            this.homePos = new Vec2(data.x, data.y);
        }

        (this.html.querySelector(".artist")! as HTMLDivElement).innerText = data.username;
    }

    // abstract implementations

    public doForces(){ 
        // TODO: implement
    }

    public getSerialized(): SoundcloudNodeData {
        return {
            ...this.data,
            x: this.pos.x / this.manager.nodeContainer.clientWidth,
            y: this.pos.y / this.manager.nodeContainer.clientHeight,
        }
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
        super(templateNode, nodeContainer, lineContainer, data);
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