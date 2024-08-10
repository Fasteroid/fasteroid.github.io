
import { clamp, Vec2 } from "../../lib/utils";
import { GraphEdgeData, GraphNodeData, GraphNodeDataset } from "./interfaces";

/**
 * This new class encompasses the most basic functionalities
 * of the old SkillTreeNodeManager class.
 * 
 * @param Data - Minimum specs for node data in this graph.
 * @param Node - Minimum specs for node methods in this graph.  Leave blank for bare minimum.
 * @param Edge - Minimum specs for edge methods in this graph.  Leave blank for bare minimum.
 */
export abstract class GraphManager<
    Data     extends GraphNodeData = GraphNodeData,
    EdgeData extends GraphEdgeData = GraphEdgeData,
    Edge     extends GraphEdge<EdgeData> = GraphEdge<EdgeData>,
    Node     extends GraphNode<Data, Edge> = GraphNode<Data, Edge>
> {
    public readonly template:  HTMLElement;

    public readonly nodeContainer: HTMLElement;
    public readonly edgeContainer: SVGSVGElement;

    public readonly nodes: Map<string | number, Node> = new Map();
    public readonly edges: Edge[] = [];

    protected abstract createNode(data: Data): Node;
    protected abstract createEdge(data: GraphEdgeData): Edge;

    private _frame = () => {
        this.nodes.forEach( node => node.render() );
        this.edges.forEach( edge => edge.render() );
    }

    constructor(
        template: HTMLElement, 
        nodeContainer: HTMLElement,
        edgeContainer: SVGSVGElement,
        data: GraphNodeDataset<Data>
    ){
        this.template  = template;
        this.nodeContainer = nodeContainer;
        this.edgeContainer = edgeContainer;

        for(const id in data.nodes){
            this.nodes.set(id, this.createNode(data.nodes[id]));
        }

        for(const edgeData of data.edges){
            let edge = this.createEdge(edgeData);
            this.nodes.get(edgeData.node1)!.edges.push(edge);
            this.nodes.get(edgeData.node2)!.edges.push(edge);
            this.edges.push(edge);
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

    protected node1: GraphNode;
    protected node2: GraphNode;

    constructor(
        manager: GraphManager<GraphNodeData, EdgeData, GraphEdge, GraphNode>,
        data:    EdgeData
    ){
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "line");
        this.svg.classList.add("graph-edge");

        this.node1 = manager.nodes.get(data.node1)!;
        this.node2 = manager.nodes.get(data.node2)!;

        manager.edgeContainer.appendChild(this.svg);
    }

    /**
     * Called once per simulation frame; updates velocity via {@link applyForce} calls.
     */
    public abstract doForces(): void;

    public render(){
        this.svg.setAttribute("x1", `${this.node1.pos.x}`);
        this.svg.setAttribute("y1", `${this.node1.pos.y}`);
        this.svg.setAttribute("x2", `${this.node2.pos.x}`);
        this.svg.setAttribute("y2", `${this.node2.pos.y}`);
    }

}

/**
 * This new class encompasses the most basic functionalities 
 * of the old SkillTreeNode class.
 * 
 * This should be enough to get a simulation running.
 */
export abstract class GraphNode<
    Data extends GraphNodeData = GraphNodeData, 
    Edge extends GraphEdge = GraphEdge
>{

    public pos: Vec2 = new Vec2();
    public vel: Vec2 = new Vec2();

    public readonly html: HTMLElement;
    public readonly id:  string | number;

    public readonly edges: Edge[] = [];

    private _style: CSSStyleDeclaration;
    private readonly manager: GraphManager<Data>;

    constructor(
        manager: GraphManager<Data>, 
        data: Data
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