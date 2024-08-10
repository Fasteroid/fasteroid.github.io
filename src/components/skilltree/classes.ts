import { clamp, Vec2 } from "$lib/utils";
import { GraphEdge, GraphManager, GraphNode } from "../graph/classes";
import { DynamicSkillTreeNodeData2, SkillTreeDataSet2, SkillTreeEdgeData, SkillTreeNodeData, SkillTreeNodeData2 } from "./classes/interfaces";
import { StaticSkillTreeNodeData2 } from "./interfaces";

function forceFalloff(d: number){
    return d<0?d*0.05:d*(0.05 + (d/500)*0.45);
}

function getPos(el: any /*HTMLElement*/) { // cursed function from stackoverflow, don't ask me how it works
    for (var lx=0, ly=0;
        el != null;
        lx += el.offsetLeft, ly += el.offsetTop, el = el.offsetParent);
    return new Vec2(lx, ly);
}

function rand(): number {
    return Math.random() * 2 - 1
}

const NODE_DISTANCE  = 1.2;
const NODE_PADDING   = 1.2;
const NODE_MAX_VEL   = 80;
const NODE_BOB_FORCE = 2;
const GRAVITY        = 1.5;

export class SkillTreeEdge extends GraphEdge<SkillTreeNodeData2, SkillTreeEdgeData, SkillTreeNode2> {

    public dist: number;

    constructor(private manager: SkillTreeManager, data: SkillTreeEdgeData){
        super(manager, data);
        this.dist = data.dist;
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


}

export abstract class SkillTreeNode2 extends GraphNode<SkillTreeNodeData2, SkillTreeEdgeData, SkillTreeEdge> {

    public abstract tier: number;
    public readonly type: "dynamic" | "static";

    declare readonly manager: SkillTreeManager;

    constructor(manager: SkillTreeManager, data: SkillTreeNodeData2){
        super(manager, data);

        this.type = data.type;
        this.html.querySelector(".front")!.innerHTML = data.id;

        // fade the node in
        this.html.animate(
            { opacity: [0, 1] },
            { duration: 250 }
        )

        // TODO: WebGL edges
        // TODO: edge.hovered
        this.html.addEventListener("mouseover", () => {
            for( const edge of this.edges ){
                edge.svg.classList.toggle("thick", true);
            }
        })

        this.html.addEventListener("mouseout", () => {
            for( const edge of this.edges ){
                edge.svg.classList.toggle("false", true);
            }
        })
    }

    public getSerialized(): SkillTreeNodeData2 {
        return {
            id:   this.id,
            x:    this.pos.x / this.manager.nodeContainer.clientWidth,
            y:    this.pos.y / this.manager.nodeContainer.clientHeight,
            type: this.type
        }
    }

}

export class SkillTreeDynamicNode2 extends SkillTreeNode2 {

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

    constructor(manager: SkillTreeManager, data: DynamicSkillTreeNodeData2){
        super(manager, data);

        this.desc     = data.desc;
        this.cssClass = data.style;

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
        
        this.setPos( manager.nodeContainer.clientWidth * 0.5, 0 );
        this.applyForce( rand() * 10, rand() * 10 );
    }

    private startDrag(){
        this.dragListener = ((ev: MouseEvent | TouchEvent) => this.dragEvent(ev));
        this.html.classList.toggle("grabbed",true);
        document.addEventListener("mousemove",this.dragListener);
        document.addEventListener("touchmove",this.dragListener);
    }

    private stopDrag(){
        if(!this.dragListener) return;
        document.removeEventListener("mousemove",this.dragListener);
        document.removeEventListener("touchmove",this.dragListener);
        this.html.classList.toggle("grabbed",false);
        this.dragListener = null;
    }

    private dragEvent(e: MouseEvent | TouchEvent){
        // thanks random blog: https://www.horuskol.net/blog/2020-08-15/drag-and-drop-elements-on-touch-devices/
        if( e instanceof MouseEvent ){ // mouse event
            this.setPos(
                e.clientX - this.manager.containerPos.x, 
                e.clientY - this.manager.containerPos.y + window.scrollY
            );
        }
        else{ // touch event
            this.setPos(
                e.changedTouches[0].clientX - this.manager.containerPos.x, 
                e.changedTouches[0].clientY - this.manager.containerPos.y + window.scrollY
            );
        }
        this.vel.setTo(0,0);
    }

    private doRepulsionForce(that: SkillTreeNode2) {
        const dist = this.pos.distance(that.pos)+0.1; // todo: don't compute this twice since we may find it in the above func
        const nx = (that.pos.x-this.pos.x)/dist;
        const ny = (that.pos.y-this.pos.y)/dist;
        const fac = clamp((dist - this.manager.relativeDistance*NODE_DISTANCE)*0.03,-2,0);
        this.applyForce(nx*fac,ny*fac);
        that.applyForce(-nx*fac,-ny*fac);

        if(dist < this.manager.relativeDistance*0.8){ // if two nodes intersect, nudge them in the right directions
            const diff = (this.tier - that.tier) * 0.5;
            this.applyForce(0, diff);
            that.applyForce(0, -diff);            
        }        
    }

    private doHomingForce(){
        if(this.homePos){
            const force = this.homePos.clone();
            force.x = force.x * this.manager.nodeContainer.clientWidth; // homePos is relative
            force.y = force.y * this.manager.nodeContainer.clientWidth;
            if(force.distance(this.pos) < this.manager.relativeDistance * 0.5 ){
                this.homePos = undefined;
                return;
            }
            force.scaleBy(-1);
            force.addToV(this.pos);
            force.scaleBy(-1);
            const speed = force.normalize();
            force.scaleBy(clamp(speed, 0, 15));
            const damp = this.vel.clone();
            damp.scaleBy(-0.2);
            force.addToV(damp);
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

        this.doWallForce();
        this.doHomingForce();
    }

    public doPositioning(){
        if(this.dragListener){ return }
        let speed = this.vel.normalize();
        speed = Math.min(speed + 0.01, NODE_MAX_VEL);
        this.vel.scaleBy(speed * 0.9)
        this.pos.addTo(this.vel.x, this.vel.y)
        this.setPos(this.pos.x, this.pos.y); // clamp
    }     
    
}

export class SkillTreeStaticNode2 extends SkillTreeNode2 {

    public readonly tier: number;

    public readonly x: number;
    public readonly y: number;

    constructor(manager: SkillTreeManager, data: StaticSkillTreeNodeData2){
        super(manager, data);
        this.tier = data.tier;
        this.x    = data.x;
        this.y    = data.y;

        this.html.classList.add("static")
        this.html.querySelector(".back")!.remove();
    }

    public doForces(){ }

    public doPositioning(){ 
        this.setPos(
            this.x * this.manager.nodeContainer.clientWidth,
            this.y * this.manager.nodeContainer.clientHeight
        );
    }

}


export class SkillTreeManager 
extends GraphManager<
    SkillTreeNodeData2,
    SkillTreeEdgeData,
    SkillTreeEdge,
    SkillTreeNode2
> {

    public relativeDistance = 120;
    public relativePadding  = 120;
    public containerPos: Vec2;

    private _firstNode: SkillTreeNode2;

    protected override handleResize(){
        this.containerPos = getPos(this.nodeContainer);
        this.relativeDistance = NODE_DISTANCE * this._firstNode.html.clientWidth;
        this.relativePadding  = NODE_PADDING  * this._firstNode.html.clientWidth;
        super.handleResize();
    }

    constructor(nodeContainer: HTMLElement, templateNode: HTMLElement, lineContainer: SVGSVGElement, data: SkillTreeDataSet2){
        super(nodeContainer, templateNode, lineContainer, data);
        this._firstNode = this.nodes.values().next().value!;
        this.containerPos = getPos(nodeContainer);
    }

    protected override createNode(data: SkillTreeNodeData2): SkillTreeNode2 {
        switch(data.type){
            case "dynamic": return new SkillTreeDynamicNode2(this, data as DynamicSkillTreeNodeData2);
            case "static":  return new SkillTreeStaticNode2(this, data as StaticSkillTreeNodeData2);
        }
    }

    protected override createEdge(data: SkillTreeEdgeData): SkillTreeEdge {
        return new SkillTreeEdge(this, data);
    }

}