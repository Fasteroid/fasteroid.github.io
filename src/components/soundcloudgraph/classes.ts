import { clamp, Color, Vec2 } from "$lib/utils";
import { PanZoomOptions } from "panzoom";
import { GraphEdge, GraphManager, GraphNode } from "../graph/classes";

import type { SoundcloudEdgeData, SoundcloudGraphDataset, SoundcloudNodeData } from "$lib/soundcloud/types/native";

const abs = Math.abs
const sqrt = Math.sqrt

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

    public getSerialized(): SoundcloudEdgeData {
        return {
            from: this.from.id,
            to:   this.to.id,
        }
    }

    // degree, actual_path => number of ways
    private connectivities: Map<number, number> = new Map();

    private getExtendedConnectivity(degree: number): number {

        let start = this.from;
        let end   = this.to;

        let precalc = this.connectivities.get(degree);
        if( precalc !== undefined ) return precalc;

        if( degree === 1 ) {
            let strength = this.bidirectional ? 2 : 1;
            this.connectivities.set(degree, strength);
            return strength;
        }
        else {
            let strength = this.getExtendedConnectivity(degree - 1);
            
            let explored: Set<SoundcloudNode> = new Set();
            let leaves:   SoundcloudNode[] = start.neighbors;

            for (let i = 1; i < degree; i++) {
                let newleaves: SoundcloudNode[] = [];
                for( let leaf of leaves ){
                    explored.add(leaf);
                    for( let air of leaf.neighbors ){
                        if( !explored.has(air) ){
                            newleaves.push(air);
                        }
                    }
                }
                leaves = newleaves
            }
            
            for( let leaf of leaves ){
                let direct = leaf.edges.find( (edge) => edge.from === end || edge.to === end );
                if( direct ){
                    strength += direct.bidirectional ? 2 : 1;
                }
            }

            strength = Math.log10(strength );

            this.connectivities.set(degree, strength);

            return strength;
        }

    }

    public doForces() {
        const childNode  = this.from!;
        const parentNode = this.to!;

        const dist = childNode.pos.distance(parentNode.pos);
        let factor = clamp(dist * 0.05, 0, 1)
        const dir  = childNode.pos.copy.subV(parentNode.pos).scaleBy(factor / dist);

        this.from!.vel.subV(dir);
        this.to!.vel.addV(dir);
        
    }

}


export class SoundcloudNode extends GraphNode<SoundcloudNodeData, SoundcloudEdgeData, SoundcloudEdge> {

    declare readonly manager: SoundcloudGraphManager;

    constructor(manager: SoundcloudGraphManager, data: SoundcloudNodeData){

        super(manager, data);

        this.vel.addV( new Vec2( Math.random() * 2 - 1, Math.random() * 2 - 1 ).scaleBy(20) );
        this.pos = new Vec2( Math.random() * 2 - 1, Math.random() * 2 - 1 ).scaleBy(400);

        (this.html.querySelector(".text-outline")! as HTMLDivElement).innerText = data.username;
        this.html.style.backgroundImage = `url(${data.avatar_url})`;

        let textMain = this.html.querySelector(".text-main")! as HTMLDivElement;
        textMain.innerText = data.username;
        textMain.addEventListener('click', () => {
            if( this.manager.cancelUrlOpen ) return;
            window.open(data.permalink_url, '_blank', 'noopener, noreferrer');
        });

        // stuff for debugging
        (window as any).SoundcloudArtists = (window as any).SoundcloudArtists ?? {};
        (window as any).SoundcloudArtists[ data.username ] = this;
        
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
        let dist = this.pos.distance(that.pos) + 5;

        const f = this.pos.copy.subV(that.pos).scaleBy(-40000 / (dist**3))

        that.vel.addV(f);
        this.vel.subV(f);
    }

    private doCenterSeekingForce(){
        this.vel.addV( this.pos.copy.clampLength(0, 100).scaleBy(-0.1) );
    }

    public override doPositioning(){
        this.vel.scaleBy(0.4)
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