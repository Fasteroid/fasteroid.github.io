import { GRAVITY, NODE_BOB_FORCE, NODE_DISTANCE, NODE_MAX_VEL } from "./constants";
import type { DynamicSkillTreeNodeData, SkillTreeNodeData, StaticSkillTreeNodeData } from "./interfaces";
import { SkillTreeManager, SkillTreeNodeManager, SkillTreeLineManager } from "./managers";
import type { SkillTreeLine } from "./treeline";
import { clamp, Vec2 } from "./utils";

function rand(): number {
    return Math.random() * 2 - 1
}

export class SkillTreeNode implements SkillTreeNodeData {

    lines:   SkillTreeLine[] = [];
    name:    string;
    tier:     number = 0;
    latitude: number = 0.5

    pos: Vec2 = new Vec2();
    vel: Vec2 = new Vec2();

    html:      HTMLElement;
    htmlStyle: CSSStyleDeclaration;

    constructor(data: SkillTreeNodeData){
        this.name = data.name

        this.html = SkillTreeNodeManager.templateNode.cloneNode(true) as HTMLElement;
        this.html.hidden = false;
        this.htmlStyle = this.html.style;
        this.html.querySelector(".front")!.innerHTML = data.name;
        this.htmlStyle.left = `${this.pos.x}px`;
        this.htmlStyle.top = `${this.pos.y}px`;
        this.html.id = ""

        SkillTreeManager.nodeContainer.appendChild(this.html)
    }

    setPos(x: number, y: number){
        this.pos.x = clamp(x,0,SkillTreeNodeManager.container.clientWidth);
        this.pos.y = clamp(y,0,SkillTreeNodeManager.container.clientHeight);       
    }

    applyForce(x: number, y: number){
        this.vel.x += x;
        this.vel.y += y;
    }

    render(){
        this.htmlStyle.left = `${Math.round(this.pos.x)}px`;
        this.htmlStyle.top = `${Math.round(this.pos.y)}px`;
    }

}

export class DynamicSkillTreeNode extends SkillTreeNode implements DynamicSkillTreeNodeData {

    lines:   SkillTreeLine[] = [];
    canMouseOver: boolean  = true;
    mouseForce:   number = 0;

    desc:    string[];
    style:   string;
    parents: {[name: string]: number};

    dragListener: ((this: Document, ev: MouseEvent | TouchEvent) => any) | null = null;

    getRecursiveProperties(){
        const parentList = Object.keys( this.parents )

        let tier     = this.tier;
        let latitude = this.latitude;

        for(let parentName of parentList){
            let parent = SkillTreeNodeManager.namedNodes[parentName]
            if(!parent){
                console.warn(`${self}: Attempt to access node ${parentName} before instantiation!`)
                continue
            };
            tier     = Math.max(tier, parent.tier);
            latitude = latitude * 0.5 + parent.latitude
        }

        return {
            tier: tier + 1,
            latitude: latitude
        };
    }

    constructor(data: DynamicSkillTreeNodeData){

        super(data);
        
        this.parents = data.parents;
        this.desc    = data.desc;
        this.style   = data.style
        this.html.classList.add(data.style);
        const recurProps = this.getRecursiveProperties();

        this.latitude = recurProps.latitude
        this.tier     = recurProps.tier

        this.html.querySelector(".back")!.innerHTML = this.desc.join("<br><br>")

        // setupDragEvents
        let self = this;
        this.html.addEventListener("mouseover",() => {
            if( self.canMouseOver ){
                this.mouseForce = NODE_BOB_FORCE;
                self.canMouseOver = false;
                setTimeout(() => {self.canMouseOver = true;}, 100);
            }
        });
        this.html.addEventListener("mouseout",() => {
            if( self.canMouseOver ){
                self.canMouseOver = false;
                setTimeout(() => {self.canMouseOver = true;}, 100);
            }
        });
        this.html.addEventListener("mousedown",() => this.startDrag());
        this.html.addEventListener("touchstart",() => this.startDrag());

        // setupDynamicNode 
        for( let [parent, dist] of Object.entries(data.parents) ){
            SkillTreeLineManager.create(data.name, parent, dist);
        }
        
        this.setPos( SkillTreeNodeManager.container.clientWidth/2, 0 );
        this.applyForce( (this.latitude - 0.5) * 100, this.tier * 10 );

    }

    startDrag(){
        this.dragListener = ((ev: MouseEvent | TouchEvent) => this.dragEvent(ev));
        this.html.classList.toggle("grabbed",true);
        document.addEventListener("mousemove",this.dragListener);
        document.addEventListener("touchmove",this.dragListener);
    }

    stopDrag(){
        if(!this.dragListener) return;
        document.removeEventListener("mousemove",this.dragListener);
        document.removeEventListener("touchmove",this.dragListener);
        this.html.classList.toggle("grabbed",false);
        this.dragListener = null;
    }

    dragEvent(e: MouseEvent | TouchEvent){
        // thanks random blog: https://www.horuskol.net/blog/2020-08-15/drag-and-drop-elements-on-touch-devices/
        if( e instanceof MouseEvent ){ // mouse event
            this.setPos(
                e.clientX - SkillTreeManager.containerPos.x, 
                e.clientY - SkillTreeManager.containerPos.y + window.scrollY
            );
        }
        else{ // touch event
            this.setPos(
                e.changedTouches[0].clientX - SkillTreeManager.containerPos.x, 
                e.changedTouches[0].clientY - SkillTreeManager.containerPos.y + window.scrollY
            );
        }
        this.vel.setTo(0,0);
    }

    repelForce(that: SkillTreeNode){
        const dist = this.pos.distance(that.pos)+0.1; // todo: don't compute this twice since we may find it in the above func
        const nx = (that.pos.x-this.pos.x)/dist;
        const ny = (that.pos.y-this.pos.y)/dist;
        const fac = clamp((dist - SkillTreeManager.relativeDistance*NODE_DISTANCE)*0.03,-2,0);
        this.applyForce(nx*fac,ny*fac);
        that.applyForce(-nx*fac,-ny*fac);

        if(dist < SkillTreeManager.relativeDistance*0.8){ // if two nodes intersect, nudge them in the right directions
            const diff = (this.tier - that.tier) * 0.5;
            this.applyForce(0, diff);
            that.applyForce(0, -diff);            
        }
    }

    doWallConstraints(){
        if( this.pos.x < SkillTreeManager.relativePadding ){
            this.applyForce( ((SkillTreeManager.relativePadding - this.pos.x)**2)*0.00005, 0 );
        }
        else if( this.pos.x > SkillTreeManager.nodeContainer.clientWidth - SkillTreeManager.relativePadding ){
            this.applyForce( -((SkillTreeManager.nodeContainer.clientWidth - SkillTreeManager.relativePadding - this.pos.x)**2)*0.00005, 0 );
        }

        if( this.pos.y < SkillTreeManager.relativePadding ){
            this.applyForce( 0, ((SkillTreeManager.relativePadding - this.pos.y)**2)*0.00005 );
        }
        else if( this.pos.y > SkillTreeManager.nodeContainer.clientHeight - SkillTreeManager.relativePadding ){
            this.applyForce( 0, -((SkillTreeManager.nodeContainer.clientHeight - SkillTreeManager.relativePadding - this.pos.y)**2)*0.00005 );
        }
    }

    doForces(){

        this.applyForce(0, GRAVITY); // gravity
        this.mouseForce = clamp(this.mouseForce - 0.1,0,Infinity);
        this.applyForce(0, -this.mouseForce);

        for( let line of this.lines ){ // elastic constraints
            line.doElasticConstraint();
        }

        for( let that of SkillTreeNodeManager.allNodes ){ // repulsive forces
            this.repelForce(that);
        }

        this.doWallConstraints();

    }

    doPositioning(){
        if(this.dragListener){ return }
        let speed = this.vel.normalizeReturnLength();
        speed = Math.min(speed + 0.01, NODE_MAX_VEL);
        this.vel.scaleBy(speed * 0.9)
        this.pos.addTo(this.vel.x, this.vel.y)
        this.setPos(this.pos.x, this.pos.y); // clamp
    }

}

export class StaticSkillTreeNode extends SkillTreeNode implements StaticSkillTreeNodeData {
    tier: number;
    x: number;
    y: number
    latitude: number;

    constructor(data: StaticSkillTreeNodeData){
        super(data);
        this.tier = data.tier
        this.x    = data.x
        this.y    = data.y
        this.latitude = data.x

        this.html.classList.add("static")
        this.html.querySelector(".back")!.remove();

        this.render();
    }

    render(){
        this.setPos(SkillTreeManager.nodeContainer.clientWidth * this.x, this.y)
        super.render();
    }

    applyForce(x: number, y: number){ }
}