import { clamp, Color } from '$lib/utils';
import { Vec2 } from '$lib/vec2';
import * as d3 from 'd3';
import { GraphEdge2, GraphManager2, GraphNode2 } from '../graph/GraphManager2';
import type { SkillTreeDataSet, SkillTreeDynamicNodeData, SkillTreeEdgeData, SkillTreeNodeData, SkillTreeStaticNodeData } from "./interfaces";


function rand(): number {
    return Math.random() * 2 - 1
}

const NODE_DISTANCE  = 1.2;
const NODE_PADDING   = 1.2;
const NODE_MAX_VEL   = 80;
const NODE_BOB_FORCE = 2;
const GRAVITY        = 2;

export class SkillTreeEdge extends GraphEdge2 {

    public hovered: boolean = false;

    public static readonly thin  = 4;
    public static readonly thick = 9;

    public width: number = SkillTreeEdge.thin;

    public readonly dist: number;

    private _frame = () => {
        this.width = clamp(this.width + (this.hovered ? 0.2 : -0.2), SkillTreeEdge.thin, SkillTreeEdge.thick);
        requestAnimationFrame(this._frame);
    }

    public static readonly WHITE = new Color(1,1,1);
    public color = SkillTreeEdge.WHITE;

    constructor(    
        public readonly source: SkillTreeNode,
        public readonly target: SkillTreeNode,
        data: SkillTreeEdgeData
    ){
        super();
        this.dist = data.dist;
    }

    public getSerialized(): SkillTreeEdgeData {
        return {
            from: this.source.id,
            to:   this.target.id,
            dist: this.dist
        }
    }

}

export abstract class SkillTreeNode extends GraphNode2 {

    declare edges: SkillTreeEdge[];
    public readonly type: 'static' | 'dynamic'; 
    public readonly id: string;

    constructor(manager: SkillTreeManager2, data: SkillTreeNodeData){
        super(manager as unknown as GraphManager2<GraphNode2, GraphEdge2>);

        this.type = data.type;
        this.id   = data.id;

        this.html.querySelector(".front")!.innerHTML = data.id;

        // fade the node in
        this.html.animate(
            { opacity: [0, 1] },
            { duration: 250 }
        )

        this.html.addEventListener("mouseover", () => {
            for( const edge of this.edges ){
                edge.hovered = true;
            }
        })

        this.html.addEventListener("mouseout", () => {
            for( const edge of this.edges ){
                edge.hovered = false;
            }
        })
    }

    public abstract getSerialized(): SkillTreeNodeData;

}

export class SkillTreeDynamicNode extends SkillTreeNode {

    // d3 fixed position
    protected fx: number | undefined;
    protected fy: number | undefined;

    private canMouseOver: boolean = true;
    private mouseForce:   number  = 0;

    private homePos?: Vec2;

    public readonly desc:     string[];
    public readonly cssClass: string;

    private dragListener: ((this: Document, ev: MouseEvent | TouchEvent) => any) | null = null;

    constructor(private manager: SkillTreeManager2, data: SkillTreeDynamicNodeData){
        super(manager, data);

        this.desc     = data.desc;
        this.cssClass = data.style;

        this.html.classList.add(this.cssClass);

        if( data.x !== undefined && data.y !== undefined ){ // do we have a home?
            this.homePos = new Vec2(data.x, data.y);
        }

        this.html.querySelector(".back")!.innerHTML = this.desc.join("<br><br>");

        // setupDragEvents
        this.html.addEventListener("mouseover",() => {
            if( this.canMouseOver ){
                this.mouseForce = NODE_BOB_FORCE;
                this.canMouseOver = false;
                setTimeout(() => {this.canMouseOver = true;}, 100);
            }
        });

        this.html.addEventListener("mouseout",() => {
            if( this.canMouseOver ){
                this.canMouseOver = false;
                setTimeout(() => {this.canMouseOver = true;}, 100);
            }
        });
        
        this.html.addEventListener("mousedown",() => this.startDrag());
        this.html.addEventListener("touchstart",() => this.startDrag());

        document.addEventListener("mouseup",() => this.stopDrag());
        document.addEventListener("touchend",() => this.stopDrag());
        
        this.x = manager.nodeContainer.clientWidth * 0.5;
        this.y = 0;
        this.vx = rand() * 10;
        this.vy = rand() * 10;
    }

    private startDrag(){
        if(this.dragListener) return;
        this.dragListener = ((ev: MouseEvent | TouchEvent) => this.dragEvent(ev));
        this.html.classList.toggle("grabbed",true);
        document.addEventListener("mousemove",this.dragListener);
        document.addEventListener("touchmove",this.dragListener);
    }

    private stopDrag(){
        if(!this.dragListener) return;
        this.fx = undefined;
        this.fy = undefined;
        document.removeEventListener("mousemove",this.dragListener);
        document.removeEventListener("touchmove",this.dragListener);
        this.html.classList.toggle("grabbed",false);
        this.dragListener = null;
    }

    private dragEvent(e: MouseEvent | TouchEvent){
        let event: MouseEvent | Touch = ( e instanceof TouchEvent ) ? e.touches[0] : e;

        this.fx = event.clientX;
        this.fy = event.clientY;

        // this.manager.transformDragEventToSimulationCoords(this.pos);

        this.vx = 0;
        this.vy = 0;
    }

    public getSerialized(): SkillTreeDynamicNodeData {
        return {
            id:    this.id,
            x:     this.x / this.manager.nodeContainer.clientWidth,
            y:     this.y / this.manager.nodeContainer.clientHeight,
            type:  "dynamic",
            desc:  this.desc,
            style: this.cssClass
        }
    }
    
}

export class SkillTreeStaticNode extends SkillTreeNode {

    public readonly tier: number;

    // d3 fixed position
    public fx: number;
    public fy: number;

    constructor(private manager: SkillTreeManager2, data: SkillTreeStaticNodeData){
        super(manager, data);
        this.tier  = data.tier;
        this.fx    = data.x * manager.nodeContainer.clientWidth;
        this.fy    = data.y * manager.nodeContainer.clientHeight;

        this.html.classList.add("static")
        this.html.querySelector(".back")!.remove();
    }


    public getSerialized(): SkillTreeStaticNodeData {
        return {
            id:   this.id,
            x:    this.fx / this.manager.nodeContainer.clientWidth,
            y:    this.fy / this.manager.nodeContainer.clientHeight,
            type: "static",
            tier: this.tier
        }
    }

}


export class SkillTreeManager2
extends GraphManager2<
    SkillTreeNode,
    SkillTreeEdge,
    SkillTreeNodeData,
    SkillTreeEdgeData
> {

    public relativeDistance = 120;
    public relativePadding  = 120;

    protected _someNode!: SkillTreeNode;

    constructor(templateNode: HTMLElement, nodeContainer: HTMLElement, lineContainer: HTMLCanvasElement, data: SkillTreeDataSet){

        super(
            templateNode, 
            nodeContainer, 
            lineContainer, 
            function(this: SkillTreeManager2, edgeData) { 
                return new SkillTreeEdge( this.nodes.get(edgeData.from)! , this.nodes.get(edgeData.to)!, edgeData)
            },
            function(this: SkillTreeManager2, nodeData) {
                console.log("Creating node:", nodeData);
                switch(nodeData.type) {
                    case 'dynamic':
                        return this._someNode = new SkillTreeDynamicNode(this, nodeData as SkillTreeDynamicNodeData);
                    case 'static':
                        return this._someNode = new SkillTreeStaticNode(this, nodeData as SkillTreeStaticNodeData);
                }
            },
            data
        )

        this.simulation.force( "collisions", d3.forceCollide<SkillTreeNode>( (node) => node.html.clientWidth ).strength(0.1) ) // sqrt(2) / 2

        this.linkForces.distance( (edge: SkillTreeEdge) => edge.dist * this.relativeDistance * 1.5 );

        // gravity
        this.simulation.force("gravity", (alpha: number) => {
            for( const node of this.nodes.values() ){
                if( node instanceof SkillTreeDynamicNode ){
                    node.vy += GRAVITY * alpha;
                }
            }
        });

        // keep nodes inside the container
        this.simulation.force("containment", (alpha: number) => {
            const w = this.nodeContainer.clientWidth;
            const h = this.nodeContainer.clientHeight;

            for( const node of this.nodes.values() ){
                if( node instanceof SkillTreeDynamicNode ){

                    // padding
                    const paddingX = NODE_PADDING * this.relativePadding;
                    const paddingY = NODE_PADDING * this.relativePadding;

                    if( node.x < paddingX ){
                        node.vx += (paddingX - node.x) * 0.1 * alpha;
                    }
                    if( node.x > w - paddingX ){
                        node.vx -= (node.x - (w - paddingX)) * 0.1 * alpha;
                    }
                    if( node.y < paddingY ){
                        node.vy += (paddingY - node.y) * 0.1 * alpha;
                    }
                    if( node.y > h - paddingY ){
                        node.vy -= (node.y - (h - paddingY)) * 0.1 * alpha;
                    }
                }
            }
        });

        this.simulation.velocityDecay(0.1)
        this.simulation.alphaDecay(0);

    }

    public serialize(): void {
        const nodes = Array.from(this.nodes.values()).map(node => node.getSerialized());
        const edges = Array.from(this.edges.values()).map(edge => edge.getSerialized());
        
        const json = JSON.stringify({ nodes, edges }, undefined, 4);

        let element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(json));
            element.setAttribute('download', 'graph_skilltree.json');
          
            element.style.display = 'none';
            document.body.appendChild(element);
          
            element.click();
        document.body.removeChild(element);
    }

}