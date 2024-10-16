import { clamp, Color } from "$lib/utils";
import { PanZoomOptions } from "panzoom";
import { GraphEdge, GraphManager, GraphNode } from "../graph/classes";
import type { SkillTreeDataSet, SkillTreeDynamicNodeData, SkillTreeEdgeData, SkillTreeNodeData, SkillTreeStaticNodeData } from "./interfaces";
import { Vec2 } from "$lib/vec2";

function forceFalloff(d: number){
    return d<0?d*0.05:d*(0.05 + (d/500)*0.45);
}

function rand(): number {
    return Math.random() * 2 - 1
}

const NODE_DISTANCE  = 1.2;
const NODE_PADDING   = 1.2;
const NODE_MAX_VEL   = 80;
const NODE_BOB_FORCE = 2;
const GRAVITY        = 1.5;

export class SkillTreeEdge extends GraphEdge<SkillTreeNodeData, SkillTreeEdgeData, SkillTreeNode> {

    public hovered: boolean = false;
    public dist: number;

    public static readonly thin = 4;
    public static readonly thick = 9;

    public width: number = SkillTreeEdge.thin;

    private _frame = () => {
        this.width = clamp(this.width + (this.hovered ? 0.2 : -0.2), SkillTreeEdge.thin, SkillTreeEdge.thick);
        requestAnimationFrame(this._frame);
    }

    public static readonly WHITE = new Color(1,1,1);
    public color = SkillTreeEdge.WHITE;

    constructor(private manager: SkillTreeManager, data: SkillTreeEdgeData){
        super(manager, data);
        this.dist = data.dist;
        requestAnimationFrame(this._frame);
    }

    public doForces() {
        const childNode  = this.from!;
        const parentNode = this.to!;
        const dist = childNode.pos.distance(parentNode.pos) + 0.1;
        const nx = (parentNode.pos.x-childNode.pos.x)/dist;
        const ny = (parentNode.pos.y-childNode.pos.y)/dist;
        const fac = clamp( forceFalloff(dist - this.dist * this.manager.relativeDistance * NODE_DISTANCE),-2,100);
        childNode.applyForce(nx*fac,ny*fac);
        parentNode.applyForce(-nx*fac,-ny*fac);        
    }

    public getSerialized(): SkillTreeEdgeData {
        return {
            from: this.from.id,
            to:   this.to.id,
            dist: this.dist
        }
    }

}

export abstract class SkillTreeNode extends GraphNode<SkillTreeNodeData, SkillTreeEdgeData, SkillTreeEdge> {

    public abstract tier: number;
    public readonly type: "dynamic" | "static";

    declare readonly manager: SkillTreeManager;

    constructor(manager: SkillTreeManager, data: SkillTreeNodeData){
        super(manager, data);

        this.type = data.type;
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

    private canMouseOver: boolean = true;
    private mouseForce:   number  = 0;

    private homePos?: Vec2;

    public readonly desc:     string[];
    public readonly cssClass: string;

    private dragListener: ((this: Document, ev: MouseEvent | TouchEvent) => any) | null = null;

    private _tier!: number;
    public get tier(){
        if( !this._tier ){
            let tier = 0;
            for( const edge of this.edges ){ // peek parents
                if( edge.to === this ){      // are we the child?
                    tier = Math.max(tier, edge.from.tier); // get the highest parent tier
                }
            }
            this._tier = tier + 1; // we are one below the highest parent 
        }
        return this._tier;
    }

    constructor(manager: SkillTreeManager, data: SkillTreeDynamicNodeData){
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
        
        this.setPos( manager.nodeContainer.clientWidth * 0.5, 0 );
        this.applyForce( rand() * 10, rand() * 10 );
    }

    private startDrag(){
        this.manager.panzoom?.pause();
        this.dragListener = ((ev: MouseEvent | TouchEvent) => this.dragEvent(ev));
        this.html.classList.toggle("grabbed",true);
        document.addEventListener("mousemove",this.dragListener);
        document.addEventListener("touchmove",this.dragListener);
    }

    private stopDrag(){
        if(!this.dragListener) return;
        this.manager.panzoom?.resume();
        document.removeEventListener("mousemove",this.dragListener);
        document.removeEventListener("touchmove",this.dragListener);
        this.html.classList.toggle("grabbed",false);
        this.dragListener = null;
    }

    private dragEvent(e: MouseEvent | TouchEvent){
        let event: MouseEvent | Touch = ( e instanceof TouchEvent ) ? e.touches[0] : e;

        this.pos.x = event.clientX;
        this.pos.y = event.clientY;
        this.manager.transformDragEventToSimulationCoords(this.pos);

        this.vel.setTo(0,0);
    }

    private doRepulsionForce(that: SkillTreeNode) {
        const dist = this.pos.distance(that.pos)+0.1; // todo: don't compute this twice since we may find it in the above func
        let repulmul = 1.0

        if(dist < this.manager.relativeDistance*0.9){ // if two nodes intersect, nudge them in the right directions
            const diff = (this.tier - that.tier) * 0.5;
            this.applyForce(0, diff);
            that.applyForce(0, -diff);
            repulmul = 0.5;
        }        

        const nx = (that.pos.x-this.pos.x)/dist;
        const ny = (that.pos.y-this.pos.y)/dist;
        const fac = clamp((dist - this.manager.relativeDistance*NODE_DISTANCE)*0.03,-2,0) * repulmul;
        this.applyForce(nx*fac,ny*fac);
        that.applyForce(-nx*fac,-ny*fac);
    }

    private doHomingForce(){
        if(this.homePos){

            const force = this.homePos.copy;
            force.x = force.x * this.manager.nodeContainer.clientWidth; // homePos is relative
            force.y = force.y * this.manager.nodeContainer.clientHeight;

            if( force.distance(this.pos) < this.manager.relativeDistance * 0.5 ){ // close enough, stop
                this.homePos = undefined;
                return;
            }

            force.subV(this.pos);
            force.clampLength(0, 15);
            force.scaleBy(0.8);

            this.applyForce(force.x, force.y);
        }        
    }

    private doWallForce(){
        const relpad = this.manager.relativePadding;
        if( this.pos.x < relpad ){
            this.applyForce( ((relpad - this.pos.x)**2)*0.00005, 0 );
        }
        else if( this.pos.x > this.manager.nodeContainer.clientWidth - relpad ){
            this.applyForce( -((this.manager.nodeContainer.clientWidth - relpad - this.pos.x)**2)*0.00005, 0 );
        }

        if( this.pos.y < relpad ){
            this.applyForce( 0, ((relpad - this.pos.y)**2)*0.00005 );
        }
        else if( this.pos.y > this.manager.nodeContainer.clientHeight - relpad ){
            this.applyForce( 0, -((this.manager.nodeContainer.clientHeight - relpad - this.pos.y)**2)*0.00005 );
        }
    }

    // abstract implementations

    public doForces(){
        this.applyForce(0, GRAVITY);
        this.mouseForce = clamp(this.mouseForce - 0.1,0,Infinity);       
        this.applyForce(0, -this.mouseForce);

        for( const that of this.manager.nodes.values() ){
            if( that === this ) continue; // don't repel self lol
            this.doRepulsionForce(that);
        }

        this.doHomingForce();
        this.doWallForce();
    }

    public override doPositioning(){
        if(this.dragListener){ return }
        this.pos.addV( this.vel.clampLength(0, NODE_MAX_VEL).scaleBy(0.9) );
        this.setPos(this.pos.x, this.pos.y); // clamp
    }     

    public getSerialized(): SkillTreeDynamicNodeData {
        return {
            id:    this.id,
            x:     this.pos.x / this.manager.nodeContainer.clientWidth,
            y:     this.pos.y / this.manager.nodeContainer.clientHeight,
            type:  "dynamic",
            desc:  this.desc,
            style: this.cssClass
        }
    }
    
}

export class SkillTreeStaticNode extends SkillTreeNode {

    public readonly tier: number;

    public readonly x: number;
    public readonly y: number;

    constructor(manager: SkillTreeManager, data: SkillTreeStaticNodeData){
        super(manager, data);
        this.tier = data.tier;
        this.x    = data.x;
        this.y    = data.y;

        this.html.classList.add("static")
        this.html.querySelector(".back")!.remove();
    }

    public doForces(){ }

    public override doPositioning(){ 
        this.setPos(
            this.x * this.manager.nodeContainer.clientWidth,
            this.y * this.manager.nodeContainer.clientHeight
        );
    }

    public getSerialized(): SkillTreeStaticNodeData {
        return {
            id:   this.id,
            x:    this.pos.x / this.manager.nodeContainer.clientWidth,
            y:    this.pos.y / this.manager.nodeContainer.clientHeight,
            type: "static",
            tier: this.tier
        }
    }

}


export class SkillTreeManager
extends GraphManager<
    SkillTreeNodeData,
    SkillTreeEdgeData,
    SkillTreeEdge,
    SkillTreeNode
> {

    public relativeDistance = 120;
    public relativePadding  = 120;

    private _firstNode: SkillTreeNode;

    protected override handleResize(){
        this.relativeDistance = NODE_DISTANCE * this._firstNode.html.clientWidth;
        this.relativePadding  = NODE_PADDING  * this._firstNode.html.clientWidth;
        super.handleResize();
    }

    constructor(templateNode: HTMLElement, nodeContainer: HTMLElement, lineContainer: HTMLCanvasElement, data: SkillTreeDataSet){
        super(templateNode, nodeContainer, lineContainer, data);
        (window as any).manager = this;
        this._firstNode = this.nodes.values().next().value!;
        this.handleResize();
    }

    protected override createNode(data: SkillTreeNodeData): SkillTreeNode {
        switch(data.type){
            case "dynamic": return new SkillTreeDynamicNode(this, data as SkillTreeDynamicNodeData);
            case "static":  return new SkillTreeStaticNode(this, data as SkillTreeStaticNodeData);
        }
    }

    protected override createEdge(data: SkillTreeEdgeData): SkillTreeEdge {
        return new SkillTreeEdge(this, data);
    }


    public transformDragEventToSimulationCoords(v: Vec2): Vec2 {
        const thisRect = this.selfBox;
        const parentRect = this.parentBox;
        const style = this.selfComputedSize;

        const scaleX = thisRect.width / style.width;
        const scaleY = thisRect.height / style.height;

        return v.setTo(
            (v.x - thisRect.left) * scaleX + thisRect.left - parentRect.left,
            (v.y - thisRect.top)  * scaleY + thisRect.top  - parentRect.top
        );
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