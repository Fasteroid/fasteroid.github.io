import { clamp, Map2D, Set2D, Vec2 } from "../utils";
import { GraphNodeData, GraphNodeDataset } from "./interfaces";

/**
 * This new class encompasses the most basic functionalities
 * of the old SkillTreeNodeManager class.
 * 
 * @param T - Minimum specs for node data in this graph.
 * @param N - Minimum specs for node methods in this graph.  Leave blank for bare minimum.
 */
export abstract class GraphManager<Data extends GraphNodeData, Node extends GraphNode<Data> = GraphNode<Data>> {

    public readonly relations: GraphNodeDataset<Data>['relations'];
    public readonly template:  HTMLElement;
    public readonly container: HTMLElement;

    public readonly nodes:     Map<string | number, Node> = new Map();

    /**
     * This method is called by the constructor to create a new node.
     * 
     * @param manager - The GraphManager instance that is creating the node.
     * @param data    - The data to associate with the new node.
     * 
     * @returns A new GraphNode instance.
     */
    protected abstract createNode(manager: GraphManager<Data, Node>, data: Data): Node;

    protected abstract createEdge(): GraphEdge;

    private _frame = () => {
        this.nodes.forEach( node => node.render() );
    }

    constructor(
        template: HTMLElement, 
        container: HTMLElement,
        data: GraphNodeDataset<Data>
    ){
        this.relations = data.relations;
        this.template  = template;
        this.container = container;

        for(const id in data.data){
            this.nodes.set(id, this.createNode(this, data.data[id]));
        }

        // TODO: edges

        // // from -> to
        // let edges: Set2D<string | number> = new Set2D();
        // for(const id in this.relations){
        //     let relation = this.relations[id];
        //     for(const to of relation.to){
        //         edges.add(id, to);
        //     }
        //     for(const from of relation.from){
        //         edges.add(from, id);
        //     }
        // }

        setInterval( () => {
            this.nodes.forEach( node => node.doForces() )
            this.nodes.forEach( node => node.doPositioning() )
            requestAnimationFrame(this._frame);
        } , 16);
    }

}

export abstract class GraphEdge<Data extends GraphNodeData> {

    svg: SVGLineElement;

    constructor(){
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "line");
    }

}

/**
 * This new class encompasses the most basic functionalities 
 * of the old SkillTreeNode class.
 * 
 * This should be enough to get a simulation running.
 */
export abstract class GraphNode<Data extends GraphNodeData, Edge extends GraphEdge<Data>> {

    public pos: Vec2 = new Vec2();
    public vel: Vec2 = new Vec2();

    public readonly html: HTMLElement;
    public readonly data: Data

    private _style: CSSStyleDeclaration;
    private readonly manager: GraphManager<Data>;

    constructor(
        manager: GraphManager<Data>,
        data:    Data
    ){
        this.manager = manager;
        this.data    = data;
        this.html    = manager.template.cloneNode(true) as HTMLElement;
        this._style  = this.html.style;
    }

    /**
     * Called once per simulation frame; updates velocity via {@link applyForce} calls.
     */
    public abstract doForces(): void;

    /**
     * Called after {@link doForces} to update position based on velocity.
     * Anything goes here.
    */ 
    public abstract doPositioning(): void;

    public abstract get edges(): Edge[];


    /**
     * Same as old setPos method.  Auto-clamps to container.
     */
    public setPos(x: number, y: number){
        this.pos.setTo(
            clamp(x,0,this.manager.container.clientWidth),
            clamp(y,0,this.manager.container.clientHeight)
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

}