import type { SimulationLinkDatum, SimulationNodeDatum } from "d3";
import type { GraphDataset, GraphEdgeData, GraphNodeData } from "./interfaces";
import { clamp, Map2D, RollingAverage } from "$lib/utils";
import { Panzoom } from "@fasteroid/panzoom-revamped";
import * as d3 from "d3";

type WideHigh = { width: number, height: number };


export abstract class GraphEdge2 implements SimulationLinkDatum<GraphNode2> {
    public bidirectional?: boolean;
    
    public abstract readonly source: GraphNode2;
    public abstract readonly target: GraphNode2;

    public render?(dt: number): void;
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

    public render(dt: number){
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

    public get edgesNeedRendering(): boolean {
        let someEdge = this.edges.values().next().value;
        return someEdge?.render !== undefined;
    }

    private _selfComputedSize: WideHigh | undefined;
    /** Width and height of the node container */
    public get selfComputedSize(): WideHigh {
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


        this.linkForces = d3.forceLink<NODE, EDGE>( this.edges.values().toArray() );
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

        setTimeout(() => {
            this.handleResize();
        })

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

    private lastTick = performance.now();
    private readonly _dt = new RollingAverage(60); // this worked pretty good for 4x slowdown via devtools

    private set dt(value: number){
        value = clamp(value, 0, 1); // if the tab is inactive for a while and then becomes active again, the first frame back will have giga dt.  clamp it.
        this._dt.push(value);
    }

    /**
     * Measured in sixtieths of a second.
     */
    public get dt(): number { return this._dt.get(); }
    
    public render() {
        this.recalculateStyle();
        
        if( this.edgesNeedRendering ){
            for( const edge of this.edges.values() ){
                edge.render?.(this.dt);
            }
        }

        for( const node of this.nodes.values() ){
            node.render(this.dt);
        }
    }

    public requestRender() {
        if( this.renderRequested ) return;

        this.dt = ( performance.now() - this.lastTick ) * 0.06; // same as dividing by (1000ms / 60fps)
        this.lastTick = performance.now();

        this.renderRequested = new Promise( (resolve) => {
            requestAnimationFrame( () => {
                this.render();
                this.renderRequested = undefined;
                resolve();
            });
        });
    }

}