import type { SimulationLinkDatum, SimulationNodeDatum } from "d3";
import type { GraphDataset, GraphEdgeData, GraphNodeData } from "./interfaces";
import { Map2D } from "$lib/utils";
import { Panzoom } from "@fasteroid/panzoom-revamped";
import * as d3 from "d3";

export abstract class GraphEdge2 implements SimulationLinkDatum<GraphNode2> {

    public bidirectional?: boolean;
    
    public abstract readonly source: GraphNode2
    public abstract readonly target: GraphNode2

}

export abstract class GraphNode2 implements SimulationNodeDatum {

    public x: number = 0;
    public y: number = 0;

    public vx: number = 0;
    public vy: number = 0;

    public readonly edges: GraphEdge2[] = [];

    public readonly html: HTMLElement;

    constructor(manager: GraphManager2<GraphNode2, GraphEdge2>) {
        this.html = manager.template.cloneNode(true) as HTMLElement;
        manager.nodeContainer.appendChild(this.html);
    }

    public render(){
        // I know I could use percent here, but that might make the text blurry.  This ensures it's always integer pixels.
        this.html.style.transform = `translate(
            ${Math.round(this.x)}px, 
            ${Math.round(this.y)}px
        )
        translate(-50%, -50%)`;
    }

}

export abstract class GraphManager2<
    NODE extends GraphNode2,
    EDGE extends GraphEdge2 & SimulationLinkDatum<NODE>,
    NODE_DATA extends GraphNodeData = GraphNodeData,
    EDGE_DATA extends GraphEdgeData = GraphEdgeData,
> {

    public readonly nodes: Map<string, NODE>   = new Map();
    public readonly edges: Map2D<string, EDGE> = new Map2D(); // from, to

    public readonly panzoom?: Panzoom;

    public readonly simulation: d3.Simulation<NODE, EDGE>;
    public readonly linkForces: d3.ForceLink<NODE, EDGE>;

    private _selfBox: DOMRect | undefined;
    /** The bounding box of the node container's */
    public get selfBox(): DOMRect {
        return this._selfBox ??= this.nodeContainer.getBoundingClientRect();
    }

    private _parentBox?: DOMRect | undefined;
    /** The bounding box of the node container's *parent* */
    public get parentBox(): DOMRect {
        return this._parentBox ??= this.nodeContainer.parentElement!.getBoundingClientRect();
    }

    private _selfComputedSize: { width: number, height: number } | undefined;
    /** Width and height of the node container */
    public get selfComputedSize(): typeof this._selfComputedSize {
        if(this._selfComputedSize === undefined){
            let style = window.getComputedStyle(this.nodeContainer);
            this._selfComputedSize = {
                width:  parseFloat(style.width),
                height: parseFloat(style.height)
            }
        }
        return this._selfComputedSize;
    }

    private recalculateStyle(){
        // nil them all
        this._selfBox = undefined;
        this._parentBox = undefined;
        this._selfComputedSize = undefined;

        // recalculate everything
        this.selfBox;
        this.parentBox;
        this.selfComputedSize;
    }

    constructor(
        public readonly template: HTMLElement, 
        public readonly nodeContainer: HTMLElement,
        public readonly edgeContainer: HTMLCanvasElement,
        public readonly createEdge: (data: EDGE_DATA) => EDGE,
        public readonly createNode: (data: NODE_DATA) => NODE,
        data: GraphDataset<NODE_DATA, EDGE_DATA>,
        usePanzoom?: boolean
    ){

        for( const nodeData of data.nodes ){
            if( nodeData === null || nodeData === undefined ) continue;
            this.nodes.set(nodeData.id, this.createNode(nodeData));
        }

        for( const edgeData of data.edges ){
            let edge: EDGE = this.edges.get(edgeData.to, edgeData.from)!;
            if( edge ){ // does the other direction exist?
                edge.bidirectional = true; // mark as bidirectional; no need to create a new edge
            }
            else {
                edge = this.createEdge(edgeData);

                const fromNode = this.nodes.get(edgeData.from);
                const toNode   = this.nodes.get(edgeData.to);

                if( fromNode === null || fromNode === undefined || toNode === null || toNode === undefined ) {
                    console.warn("Bad edge: ", edgeData);
                    continue;
                }

                fromNode.edges.push(edge);
                toNode.edges.push(edge);
                this.edges.set(edgeData.from, edgeData.to, edge);
            }
        }


        if( usePanzoom ){
            this.panzoom = new Panzoom(this.nodeContainer);
            this.panzoom.onTransformChanged( () => {
                this.requestRender();
            } );
        }


        this.linkForces = d3.forceLink<NODE, EDGE>( this.edges.values() );
        this.simulation = 
            d3.forceSimulation<NODE, EDGE>( this.nodes.values().toArray() )
            .force( "link", 
                this.linkForces 
            )
            .on("tick", () => 
                this.requestRender()
            );
        ;        

        this.oldH = this.nodeContainer.clientHeight;
        this.oldW = this.nodeContainer.clientWidth;
        window.addEventListener('resize', () => {
            this.recalculateStyle();
            this.handleResize();
            this.requestRender();
        });

    }

    private oldW: number;
    private oldH: number;
    protected handleResize(){
        
        for( const node of this.nodes.values() ){
            node.x = node.x * this.nodeContainer.clientWidth / this.oldW;
            node.y = node.y * this.nodeContainer.clientHeight / this.oldH;
        }

        this.oldW = this.nodeContainer.clientWidth;
        this.oldH = this.nodeContainer.clientHeight;

        this.edgeContainer.width  = this.nodeContainer.clientWidth;
        this.edgeContainer.height = this.nodeContainer.clientHeight
    }

    private renderRequested: Promise<void> | undefined = undefined;
    
    public render() {
        this.recalculateStyle();
        this.nodes.forEach( node => node.render() );
    }

    public requestRender() {
        if( this.renderRequested ) return;

        this.renderRequested = new Promise( (resolve) => {
            requestAnimationFrame( () => {
                this.render();
                this.renderRequested = undefined;
                resolve();
            });
        });
    }   

}