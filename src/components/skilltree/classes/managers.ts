import { NODE_DISTANCE, NODE_PADDING } from "./constants";
import { SkillTreeLine } from "./treeline";
import { DynamicSkillTreeNode, SkillTreeNode, StaticSkillTreeNode } from "./treenode";
import { Vec2 } from "./utils";

import SkillTreeData from "$lib/json/skilltree.json"
import type { DynamicSkillTreeNodeData, StaticSkillTreeNodeData } from "./interfaces";

export class SkillTreeLineManager {

    static lineObjects: SkillTreeLine[] = [];
    static svg: SVGSVGElement;

    static setup(svg: SVGSVGElement){
        SkillTreeLineManager.svg = svg;
    }

    static create(child: string, parent: string, dist: number){
        const line = new SkillTreeLine(child, parent, dist);
        SkillTreeLineManager.lineObjects.push(line);
        SkillTreeLineManager.svg.appendChild(line.svg);
    }

    static initialize(){
        for(const line of SkillTreeLineManager.lineObjects){
            line.initialize();
        }
    }

    static render(){
        for(const line of SkillTreeLineManager.lineObjects){
            line.render();
        }
    }

}

export class SkillTreeNodeManager {

    static templateNode: HTMLElement;
    static container:    HTMLElement;
    
    static dynamicNodes: DynamicSkillTreeNode[] = [];
    static staticNodes:  StaticSkillTreeNode[] = [];
    static allNodes:     SkillTreeNode[] = [];
    static namedNodes:   {[name: string]: SkillTreeNode} = {};

    static setup(templateNode: HTMLElement, container: HTMLElement){
        SkillTreeNodeManager.templateNode = templateNode;
        SkillTreeNodeManager.container    = container;
    }

    private static declare(node: SkillTreeNode){
        SkillTreeNodeManager.namedNodes[node.name] = node
        SkillTreeNodeManager.allNodes.push(node)
    }

    static createDynamic(nodeData: DynamicSkillTreeNodeData){
        const node = new DynamicSkillTreeNode(nodeData);
        SkillTreeNodeManager.dynamicNodes.push(node);
        SkillTreeNodeManager.declare(node)
    }

    static createStatic(nodeData: StaticSkillTreeNodeData){
        const node = new StaticSkillTreeNode(nodeData);
        SkillTreeNodeManager.staticNodes.push(node);
        SkillTreeNodeManager.declare(node)
    }

}

function getPos(el: any /*HTMLElement*/) { // cursed function from stackoverflow, don't ask me how it works
    for (var lx=0, ly=0;
        el != null;
        lx += el.offsetLeft, ly += el.offsetTop, el = el.offsetParent);
    return new Vec2(lx, ly);
}

export class SkillTreeManager {

    static nodeContainer: HTMLElement;
    static relativeDistance = 120;
    static relativePadding  = 120;
    static containerPos: Vec2 = new Vec2();
    static oldW: number;
    static oldH: number;
    

    static handleResize(){
        
        SkillTreeManager.containerPos = getPos(SkillTreeManager.nodeContainer);
        SkillTreeManager.relativeDistance = NODE_DISTANCE * SkillTreeNodeManager.staticNodes[0].html.clientWidth;
        SkillTreeManager.relativePadding  = NODE_PADDING  * SkillTreeNodeManager.staticNodes[0].html.clientWidth;
    
        SkillTreeNodeManager.dynamicNodes.forEach(node => {
            node.setPos( (node.pos.x/this.oldW)*this.nodeContainer.clientWidth, (node.pos.y/this.oldH)*this.nodeContainer.clientHeight );
            node.render();
        })
    
        SkillTreeNodeManager.staticNodes.forEach(node => node.render())
        SkillTreeLineManager.lineObjects.forEach(line => line.render())
    
        this.oldW = this.nodeContainer.clientWidth;
        this.oldH = this.nodeContainer.clientHeight;
    
    }

    static setup(nodeContainer: HTMLElement, templateNode: HTMLElement, lineContainer: SVGSVGElement){
        
        SkillTreeManager.nodeContainer = nodeContainer

        SkillTreeManager.containerPos = getPos(nodeContainer);
        SkillTreeManager.oldW = nodeContainer.clientWidth;
        SkillTreeManager.oldH = nodeContainer.clientHeight;

        SkillTreeNodeManager.setup(templateNode, nodeContainer);
        SkillTreeLineManager.setup(lineContainer);

        for( const staticNode of SkillTreeData.staticNodes ){
            SkillTreeNodeManager.createStatic(staticNode)
        }

        for( const dynamicNode of SkillTreeData.dynamicNodes ){
            SkillTreeNodeManager.createDynamic(dynamicNode as unknown as DynamicSkillTreeNodeData)
        }

        SkillTreeLineManager.initialize()

        window.addEventListener('resize', () => {
            SkillTreeManager.handleResize();
        });
        SkillTreeManager.handleResize();

        function frame(){
            SkillTreeNodeManager.dynamicNodes.forEach(node => node.render())
            SkillTreeLineManager.lineObjects.forEach(line => line.render())
        }
        
        setInterval( () => {
            SkillTreeNodeManager.dynamicNodes.forEach( node => node.doForces() )
            SkillTreeNodeManager.dynamicNodes.forEach( node => node.doPositioning() )
            requestAnimationFrame(frame);
        } , 16);
        
        
        document.addEventListener("mouseup",()=>{
            SkillTreeNodeManager.dynamicNodes.forEach( node => node.stopDrag() )
        });
        
        document.addEventListener("touchend",()=>{
            SkillTreeNodeManager.dynamicNodes.forEach( node => node.stopDrag() )
        });
        
    }

}
