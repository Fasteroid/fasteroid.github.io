import { clamp, Color } from '$lib/utils';
import { Vec2 } from '$lib/vec2';
import * as d3 from 'd3';
import { GraphEdge2, GraphManager2, GraphNode2 } from '../graph/GraphManager2';
import type { SkillTreeDataSet, SkillTreeDynamicNodeData, SkillTreeEdgeData, SkillTreeNodeData, SkillTreeStaticNodeData } from "./interfaces";

import EDGE_FRAG_SHADER from './edges.frag.glsl?raw';
import EDGE_VERT_SHADER from './edges.vert.glsl?raw';
import { WebGLUtils } from '$lib/webgl/utils';

function rand(): number {
    return Math.random() * 2 - 1
}

function makeSafe(n: number){
    if( isNaN(n) || !isFinite(n) ) return 0;
    return n;
}

const NODE_PADDING   = 1;
const NODE_MAX_VEL   = 80;
const NODE_BOB_FORCE = 2;
const GRAVITY        = 3;
const PADDING_FORCE  = 0.1;
const HOME_RADIUS    = 100;

export class SkillTreeEdge extends GraphEdge2 {

    public hovered: boolean = false;

    public static readonly thin  = 4;
    public static readonly thick = 9;

    public width: number = SkillTreeEdge.thin;

    private _frame = () => {
        this.width = clamp(this.width + (this.hovered ? 0.2 : -0.2), SkillTreeEdge.thin, SkillTreeEdge.thick);
        requestAnimationFrame(this._frame);
    }

    public static readonly WHITE = new Color(1,1,1);
    public color = SkillTreeEdge.WHITE;

    public get stress() {
        return ( this.source.x - this.target.x ) ** 2 + ( this.source.y - this.target.y ) ** 2
    }

    constructor(    
        public readonly source: SkillTreeNode,
        public readonly target: SkillTreeNode,
        data: SkillTreeEdgeData
    ){
        super();
    }

    public getSerialized(scalar: number): SkillTreeEdgeData {
        return {
            from: this.source.id,
            to:   this.target.id,
        }
    }

}

export abstract class SkillTreeNode extends GraphNode2 {

    declare edges: SkillTreeEdge[];
    public readonly type: 'static' | 'dynamic'; 
    public readonly id: string;

    public abstract tier: number;

    constructor(manager: SkillTreeManager2, data: SkillTreeNodeData){
        super(manager as unknown as GraphManager2<GraphNode2, GraphEdge2>);

        this.type = data.type;
        this.id   = data.id;

        this.html.querySelector(".front")!.innerHTML = data.id;
        this.html.hidden = false;

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

    private homePos?: {x: number, y: number};
    private _hasHomed: boolean = false;
    public get hasHomed() { return this._hasHomed; }

    public doHomingForces(w: number, h: number){
        if( this.homePos && !this._hasHomed ){

            const homeX = this.homePos.x * w;
            const homeY = this.homePos.y * h;

            if( Math.hypot( this.x - homeX, this.y - homeY ) < HOME_RADIUS ){
                this._hasHomed = true;
                this.vx *= 0.1;
                this.vy *= 0.1;
                // console.log("Node", this.id, "has homed."); 
                // this.html.style.boxShadow = "0 0 15px 5px rgba(0,255,0,0.6)";
                return;
            }

            this.vx += (homeX - this.x) * 0.1;
            this.vy += (homeY - this.y) * 0.1;

            this.x = this.x * 0.8 + homeX * 0.2;
            this.y = this.y * 0.8 + homeY * 0.2;
        }
    }
        

    private _tier!: number;
    private hasCustomTier = true;
    public get tier(){
        if( !this._tier ){
            this.hasCustomTier = false;
            let tier = 0;
            for( const edge of this.edges ){ // peek parents
                if( edge.target === this ){      // are we the child?
                    tier = Math.max(tier, edge.source.tier); // get the highest parent tier
                }
            }
            this._tier = tier + 1; // we are one below the highest parent 
        }
        return this._tier;
    }

    public readonly desc:     string[];
    public readonly cssClass: string;

    private dragListener: ((this: Document, ev: MouseEvent | TouchEvent) => any) | null = null;

    private static node_id: number = 0;

    constructor(private manager: SkillTreeManager2, data: SkillTreeDynamicNodeData){
        super(manager, data);

        this.desc     = data.desc;
        this.cssClass = data.style;
        
        if( data.tier ) this._tier = data.tier;

        this.html.classList.add(this.cssClass);

        if( data.x !== undefined && data.y !== undefined ){ // do we have a home?
            this.homePos = {x: data.x, y: data.y};
        }

        this.html.querySelector(".back")!.innerHTML = this.desc.join("<br><br>");

        // setupDragEvents
        this.html.addEventListener("mouseover",() => {
            if( this.canMouseOver ){
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


        // staggered reveal

        SkillTreeDynamicNode.node_id += 1;
        this.fx = this.x;
        this.fy = this.y;
        this.html.hidden = true;

        window.setTimeout( 
            () => {
                this.fx = undefined;
                this.fy = undefined;
                this.html.hidden = false;
                this.html.animate(
                    { opacity: [0, 1] },
                    { duration: 50 }
                );
                this.manager.onNodesResized();
            }, 
            SkillTreeDynamicNode.node_id * 50 
        );

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

        const [posX, posY] = this.manager.transformDragEventToSimulationCoords([event.clientX, event.clientY]);

        this.fx = posX;
        this.fy = posY;

        this.vx = 0;
        this.vy = 0;
    }

    public getSerialized(): SkillTreeDynamicNodeData {
        const result: SkillTreeDynamicNodeData ={
            id:    this.id,
            x:     this.x / this.manager.nodeContainer.clientWidth,
            y:     this.y / this.manager.nodeContainer.clientHeight,
            type:  "dynamic",
            desc:  this.desc,
            style: this.cssClass,
        }

        if( this.hasCustomTier ){
            result.tier = this._tier;
        }

        return result;
    }
    
}

export class SkillTreeStaticNode extends SkillTreeNode {

    public readonly tier: number;

    // d3 fixed position
    public get fx() { return this.data.x * this.manager.nodeContainer.clientWidth; }
    public get fy() { return this.data.y * this.manager.nodeContainer.clientHeight; }

    constructor(private manager: SkillTreeManager2, private data: SkillTreeStaticNodeData){
        super(manager, data);
        this.tier  = data.tier;

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
    public relativePadding  = 240;    
    
    private readonly gl: WebGL2RenderingContext;
    private readonly edgeBuffer: WebGLBuffer;
    private readonly resUniform: WebGLUniformLocation;

    protected get _someNode(): SkillTreeNode {
        const node = this.nodes.values().next().value;
        if( !node ) throw new Error("No nodes in the graph!");
        return node;
    }

    private _maxTier?: number;
    public get maxTier(): number {
        return this._maxTier ??= this.nodes.values().map(node => node.tier).reduce( (a, b) => Math.max(a, b), 0 );
    }

    public readonly onNodesResized = () => this.simulation.force( "collisions", d3.forceCollide<SkillTreeNode>( (node) => node.html.clientWidth * 1.2 ).strength(0.3) );

    public readonly onCanvasResized = () => {
        const dpr = window.devicePixelRatio || 1;
        const displayWidth = this.edgeContainer.clientWidth;
        const displayHeight = this.edgeContainer.clientHeight;
        
        // Set actual canvas resolution
        this.edgeContainer.width = displayWidth * dpr;
        this.edgeContainer.height = displayHeight * dpr;

        this.gl.viewport(0, 0, this.edgeContainer.width, this.edgeContainer.height);
        this.gl.uniform2f(this.resUniform, this.edgeContainer.width, this.edgeContainer.height);

        this.render(); // immediately rerender
    }



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
                        return new SkillTreeDynamicNode(this, nodeData as SkillTreeDynamicNodeData);
                    case 'static':
                        return new SkillTreeStaticNode(this, nodeData as SkillTreeStaticNodeData);
                }
            },
            data
        );



        this.linkForces.distance( this.relativeDistance ).strength( (link) => Math.min( link.stress * 1.3 / this.relativeDistance + 0.2, 1 ) )

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
                        node.vx += (paddingX - node.x) * PADDING_FORCE;
                    }
                    if( node.x > w - paddingX ){
                        node.vx -= (node.x - (w - paddingX)) * PADDING_FORCE;
                    }
                    if( node.y < paddingY ){
                        node.vy += (paddingY - node.y) * PADDING_FORCE;
                    }
                    if( node.y > h - paddingY ){
                        node.vy -= (node.y - (h - paddingY)) * PADDING_FORCE;
                    }

                    node.doHomingForces(w, h);

                }
            }
        });

        // vaguely distribute nodes by tier ( y ~ tier )
        const Y_START = 1;
        this.simulation.force("tierY", (alpha: number) => {

            const tierHeight = this.nodeContainer.clientHeight / (this.maxTier + Y_START);

            for( const node of this.nodes.values() ){

                if( node instanceof SkillTreeDynamicNode ){
                    const targetY = tierHeight * (node.tier + 0.5 + Y_START);
                    node.vy += (targetY - node.y) * 0.03 * alpha;
                }

            }
        });

        // webgl!
        {
            const gl = this.edgeContainer.getContext("webgl2");
            if( !gl ) throw new Error("WebGL2 not supported!");
            this.gl = gl;

            const program = WebGLUtils.createProgram(
                gl, 
                EDGE_FRAG_SHADER, 
                EDGE_VERT_SHADER
            );

            gl.useProgram(program);

            const templateVertices = new Float32Array([
                // First triangle
                0.0, -0.5,  // start, left
                1.0, -0.5,  // end, left
                0.0,  0.5,  // start, right
                
                // Second triangle
                0.0,  0.5,  // start, right
                1.0, -0.5,  // end, left
                1.0,  0.5,  // end, right
            ]);

            this.resUniform = gl.getUniformLocation(program, 'u_resolution')!;

            const templateBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, templateBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, templateVertices, gl.STATIC_DRAW);
    
            const a_templatePosition = gl.getAttribLocation(program, 'a_templatePosition');
            gl.enableVertexAttribArray(a_templatePosition);
            gl.vertexAttribPointer(a_templatePosition, 2, gl.FLOAT, false, 0, 0);

            const edgeBuffer = this.edgeBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, edgeBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( this.getRawEdgeData() ), gl.DYNAMIC_DRAW);
    
            // Set up per-instance attributes

            const stride = 5 * 4; // 5 floats per edge (2 + 2 + 1) * 4 bytes each
            
            const a_startPoint = gl.getAttribLocation(program, 'a_startPoint');
            gl.enableVertexAttribArray(a_startPoint);
            gl.vertexAttribPointer(a_startPoint, 2, gl.FLOAT, false, stride, 0);
            gl.vertexAttribDivisor(a_startPoint, 1); // One per instance!
            
            const a_endPoint = gl.getAttribLocation(program, 'a_endPoint');
            gl.enableVertexAttribArray(a_endPoint);
            gl.vertexAttribPointer(a_endPoint, 2, gl.FLOAT, false, stride, 2 * 4);
            gl.vertexAttribDivisor(a_endPoint, 1);
            
            const a_width = gl.getAttribLocation(program, 'a_width');
            gl.enableVertexAttribArray(a_width);
            gl.vertexAttribPointer(a_width, 1, gl.FLOAT, false, stride, 4 * 4);
            gl.vertexAttribDivisor(a_width, 1);

        }

    
        this.simulation.velocityDecay(0.15);
        this.simulation.alphaDecay(0);
        this.simulation.alpha(0.25);


        const nodeResizeWatcher = new ResizeObserver(this.onNodesResized);
        nodeResizeWatcher.observe(this._someNode.html);

        const canvasResizeWatcher = new ResizeObserver(this.onCanvasResized);
        canvasResizeWatcher.observe(this.edgeContainer);
    }

    private *getRawEdgeData(): Generator<number, void, unknown> {
        for( const edge of this.edges.values() ){
            yield edge.source.x;
            yield edge.source.y;
            yield edge.target.x;
            yield edge.target.y;
            yield edge.width;
        }
    }

    public override requestRender(): void {
        super.requestRender();
    }

    public override render() {
        super.render();

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.edgeBuffer);
        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, new Float32Array( this.getRawEdgeData() ));
        
        this.gl.clearColor(0, 0, 0, 0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
            
        // Draw all edges with one instanced draw call!
        // 6 vertices per edge, numEdges instances
        this.gl.drawArraysInstanced(this.gl.TRIANGLES, 0, 6, this.edges.size);
    }

    public transformDragEventToSimulationCoords(v: [number, number]) {
        const thisRect = this.selfBox;
        const parentRect = this.parentBox;
        const style = this.selfComputedSize;

        const scaleX = thisRect.width / style.width;
        const scaleY = thisRect.height / style.height;

        v[0] = (v[0] - thisRect.left) * scaleX + thisRect.left - parentRect.left;
        v[1] = (v[1] - thisRect.top) * scaleY + thisRect.top - parentRect.top;

        return v;
    }

    public serialize(): void {
        const nodes = Array.from(this.nodes.values()).map(node => node.getSerialized());
        const edges = Array.from(this.edges.values()).map(edge => edge.getSerialized(this.relativeDistance));
        
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