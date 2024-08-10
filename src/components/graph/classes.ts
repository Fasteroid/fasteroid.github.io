
import { clamp, Map2D, Vec2 } from "../../lib/utils";
import { GraphEdgeData, GraphNodeData, GraphDataset } from "./interfaces";

/**
 * This new class encompasses the most basic functionalities
 * of the old SkillTreeNodeManager class.
 * 
 * @param Data - Minimum specs for node data in this graph.
 * @param Node - Minimum specs for node methods in this graph.  Leave blank for bare minimum.
 * @param Edge - Minimum specs for edge methods in this graph.  Leave blank for bare minimum.
 */
export abstract class GraphManager<
    NodeData extends GraphNodeData = GraphNodeData,
    EdgeData extends GraphEdgeData = GraphEdgeData,
    Edge     extends GraphEdge<EdgeData> = GraphEdge<EdgeData>,
    Node     extends GraphNode<NodeData, Edge> = GraphNode<NodeData, Edge>
> {
    public readonly template:  HTMLElement;

    public readonly nodeContainer: HTMLElement;
    public readonly edgeContainer: SVGSVGElement;

    public readonly nodes: Map<string | number, Node>   = new Map();
    public readonly edges: Map2D<string | number, Edge> = new Map2D(); // from, to

    protected abstract createNode(data: NodeData): Node;
    protected abstract createEdge(data: GraphEdgeData): Edge;

    private _frame = () => {
        this.nodes.forEach( node => node.render() );
        this.edges.forEach( edge => edge.render() );
    }

    constructor(
        template: HTMLElement, 
        nodeContainer: HTMLElement,
        edgeContainer: SVGSVGElement,
        data: GraphDataset<NodeData>
    ){
        this.template  = template;
        this.nodeContainer = nodeContainer;
        this.edgeContainer = edgeContainer;

        for(const id in data.nodes){
            this.nodes.set(id, this.createNode(data.nodes[id]));
        }

        for(const edgeData of data.edges){
            let edge = this.edges.get(edgeData.to, edgeData.from);
            if( edge ){ // does the other direction exist?
                edge.bidirectional = true; // mark as bidirectional; no need to create a new edge
            }
            else {
                edge = this.createEdge(edgeData);
                this.nodes.get(edgeData.from)!.edges.push(edge);
                this.nodes.get(edgeData.to)!.edges.push(edge);
                this.edges.set(edgeData.from, edgeData.to, edge);
            }
        }

        setInterval( () => {
            this.nodes.forEach( node => node.doForces() )
            this.edges.forEach( edge => edge.doForces() )
            this.nodes.forEach( node => node.doPositioning() )
            this.nodes.forEach( node => node.clampToContainer() )
            requestAnimationFrame(this._frame);
        } , 16);
    }

}

export abstract class GraphEdge<EdgeData extends GraphEdgeData = GraphEdgeData> {

    protected svg: SVGLineElement;

    protected from: GraphNode;
    protected to:   GraphNode;

    public bidirectional: boolean = false;

    constructor(
        manager: GraphManager<GraphNodeData, EdgeData, GraphEdge>,
        data:    EdgeData
    ){
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "line");
        this.svg.classList.add("graph-edge");

        this.from = manager.nodes.get(data.from)!;
        this.to   = manager.nodes.get(data.to)!;

        manager.edgeContainer.appendChild(this.svg);
    }

    /**
     * Called once per simulation frame; updates velocity via {@link applyForce} calls.
     */
    public abstract doForces(): void;

    public render(){
        this.svg.setAttribute("x1", `${this.from.pos.x}`);
        this.svg.setAttribute("y1", `${this.from.pos.y}`);
        this.svg.setAttribute("x2", `${this.to.pos.x}`);
        this.svg.setAttribute("y2", `${this.to.pos.y}`);
    }

}

/**
 * This new class encompasses the most basic functionalities 
 * of the old SkillTreeNode class.
 * 
 * This should be enough to get a simulation running.
 */
export abstract class GraphNode<
    NodeData extends GraphNodeData = GraphNodeData, 
    Edge     extends GraphEdge = GraphEdge
>{

    public pos: Vec2 = new Vec2();
    public vel: Vec2 = new Vec2();

    public readonly html: HTMLElement;
    public readonly id:  string | number;

    public readonly edges: Edge[] = [];

    private _style: CSSStyleDeclaration;
    private readonly manager: GraphManager<NodeData>;

    constructor(
        manager: GraphManager<NodeData>, 
        data: NodeData
    ){
        this.manager = manager;
        this.id      = data.id;
        this.html    = manager.template.cloneNode(true) as HTMLElement;
        this._style  = this.html.style;
    }

    /**
     * Called once per simulation frame; updates velocity via {@link applyForce} calls.
     */
    public abstract doForces(): void;

    /**
     * Called after {@link doForces} to update position based on velocity.
    */ 
    public abstract doPositioning(): void;


    /**
     * Same as old setPos method.  Auto-clamps to container.
     */
    public setPos(x: number, y: number){
        this.pos.setTo(
            clamp(x,0,this.manager.nodeContainer.clientWidth),
            clamp(y,0,this.manager.nodeContainer.clientHeight)
        )
    }

    /**
     * Same as old applyForce method.
     */
    public applyForce(x: number, y: number){
        this.vel.addTo(x,y);
    }

    /**
     * Same as old render method.
     */
    public render(){
        this._style.left = `${Math.round(this.pos.x)}px`;
        this._style.top  = `${Math.round(this.pos.y)}px`;
    }

    public clampToContainer(){
        this.setPos(this.pos.x, this.pos.y);
    }

}