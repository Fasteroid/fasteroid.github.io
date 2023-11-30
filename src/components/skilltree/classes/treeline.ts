import { NODE_DISTANCE } from "./constants";
import { SkillTreeLineManager, SkillTreeManager, SkillTreeNodeManager } from "./managers";
import type { SkillTreeNode } from "./treenode";
import { clamp } from "./utils";

export class SkillTreeLine {
    
    svg:        SVGLineElement;

    childId:    string;
    childNode:  SkillTreeNode | null = null;

    parentId:   string;
    parentNode: SkillTreeNode | null = null;

    length:     number;

    initialized: boolean = false;

    constructor(childId: string, parentId: string, length: number){
        this.svg = document.createElementNS("http://www.w3.org/2000/svg","line");
        
        this.parentId = parentId;
        this.childId  = childId;

        this.length = length;

        SkillTreeLineManager.svg.appendChild(this.svg);
    }

    static forceFalloff(d: number){
        return d<0?d*0.05:d*(0.05 + (d/500)*0.45);
    }

    notInitialized(): boolean {
        if(!this.initialized){
            console.error("I'm not ready to call this function yet!");
            throw "StupidProgrammerException";
        }
        return false;
    }

    initialize(){
        this.parentNode = SkillTreeNodeManager.namedNodes[this.parentId];
        this.childNode = SkillTreeNodeManager.namedNodes[this.childId];
        if(!this.parentNode || !this.childNode){ console.warn(`Could not initialize link from ${this.parentId} to ${this.childId}`); return }
        this.parentNode.lines.push(this)
        this.childNode.lines.push(this)
        this.initialized = true;
    }

    doElasticConstraint(){
        if( this.notInitialized() ) return;
        const childNode  = this.childNode!;
        const parentNode = this.parentNode!;
        const dist = childNode.pos.distance(parentNode.pos) + 0.1;
        const nx = (parentNode.pos.x-childNode.pos.x)/dist;
        const ny = (parentNode.pos.y-childNode.pos.y)/dist;
        const fac = clamp(SkillTreeLine.forceFalloff(dist - this.length * SkillTreeManager.relativeDistance * NODE_DISTANCE),-2,100);
        childNode.applyForce(nx*fac,ny*fac);
        parentNode.applyForce(-nx*fac,-ny*fac);
    }

    render(){
        if( this.notInitialized() ) return;
        this.svg.setAttribute('x1',`${this.parentNode!.pos.x}`);
        this.svg.setAttribute('y1',`${this.parentNode!.pos.y}`);
        this.svg.setAttribute('x2',`${this.childNode!.pos.x}`);
        this.svg.setAttribute('y2',`${this.childNode!.pos.y}`);
    }

}

