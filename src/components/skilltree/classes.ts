import { clamp, Color, Derivative, RollingAverage } from '$lib/utils';
import * as d3 from 'd3';
import { GraphEdge2, GraphManager2, GraphNode2 } from '../graph/GraphManager2';
import type { SkillTreeDataSet, SkillTreeDynamicNodeData, SkillTreeEdgeData, SkillTreeNodeData, SkillTreeStaticNodeData } from "./interfaces";

import EDGE_FRAG_SHADER from './edges.frag.glsl?raw';
import EDGE_VERT_SHADER from './edges.vert.glsl?raw';
import { WebGLUtils } from '$lib/webgl/utils';
import { dev } from '$app/environment';

const NODE_PADDING   = 1;
const GRAVITY        = 3;
const PADDING_FORCE  = 0.1;
const HOME_RADIUS    = 100;

const EDGE_VERTS = new Float32Array([
    // First triangle
    0.0, -0.5,  // start, left
    1.0, -0.5,  // end, left
    0.0,  0.5,  // start, right
    
    // Second triangle
    0.0,  0.5,  // start, right
    1.0, -0.5,  // end, left
    1.0,  0.5,  // end, right
])

type Vec2 = [number, number]


export class SkillTreeEdge extends GraphEdge2 {

    public hovered: boolean = false;

    public static readonly thin  = 4;
    public static readonly thick = 9;
    public static readonly edgeAnimRate = 0.5;

    public get shouldRender() {
        return !(this.source.html.hidden || this.target.html.hidden);
    }

    private _width: number = SkillTreeEdge.thin;
    public get width() { return this.shouldRender ? this._width : 0; }

    public override render(dt: number): void {
        this._width = clamp(this._width + (this.hovered ? 1 : -1) * dt * SkillTreeEdge.edgeAnimRate, SkillTreeEdge.thin, SkillTreeEdge.thick);
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
    private homeForceMul: number = 1;
    
    private _hasHomed: boolean = false;
    public get hasHomed() { return this._hasHomed; }

    public doHomingForces(w: number, h: number){
        if( this.homePos && !this._hasHomed ){

            const homeX = this.homePos.x * w;
            const homeY = this.homePos.y * h;

            if( Math.hypot( this.x - homeX, this.y - homeY ) < HOME_RADIUS ){
                this.homeForceMul -= 0.02;
                if( this.homeForceMul <= 0 ){
                    this._hasHomed = true;
                    // console.log("Node", this.id, "has homed."); 
                    // this.html.style.boxShadow = "0 0 15px 5px rgba(0,255,0,0.6)";
                    return;
                }
                
                
                this.vx *= 0.1;
                this.vy *= 0.1;
            }

            this.vx += (homeX - this.x) * 0.1 * this.manager.dt * this.homeForceMul;
            this.vy += (homeY - this.y) * 0.1 * this.manager.dt * this.homeForceMul;

            const alpha = Math.exp(-6 * this.manager.dt * this.homeForceMul);
            this.x = this.x * (1-alpha) + homeX * alpha;
            this.y = this.y * (1-alpha) + homeY * alpha;        
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
        this.html.addEventListener("pointerenter",() => {
            if( this.canMouseOver ){
                this.canMouseOver = false;
                setTimeout(() => {this.canMouseOver = true;}, 1000); // failsafe in case pointerleave doesn't fire (a node moving off the cursor while hovering will cause this)

                // boop
                this.vx += this.manager.mouse_dx * 0.3;
                this.vy += this.manager.mouse_dy * 0.3;
            }
        });

        this.html.addEventListener('pointerleave', () => {
            setTimeout(() => {this.canMouseOver = true;}, 100);
        });

        document.addEventListener("pointerup", () => this.stopDrag());
        this.html.addEventListener("pointerdown", () => { this.stopDrag(); this.startDrag() }); // stopDrag again just in case the first one didn't fire somehow 

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

    private readonly mouse_dxs = new RollingAverage(10);
    private readonly mouse_dys = new RollingAverage(10);
    private mouse_ticked: boolean = false;

    public get mouse_dx() { return this.mouse_dxs.get(); }
    public get mouse_dy() { return this.mouse_dys.get(); }

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

        const mouse_dx = new Derivative();
        const mouse_dy = new Derivative();

        const current_mouse_pos: Vec2 = [0, 0];
    
        document.addEventListener("pointermove", (e) => {
            if( this.mouse_ticked ) return;
            this.mouse_ticked = true;

            current_mouse_pos[0] = e.clientX;
            current_mouse_pos[1] = e.clientY;

            this.transformDragEventToSimulationCoords(current_mouse_pos);

            this.mouse_dxs.push( mouse_dx.push(current_mouse_pos[0], this.dt) );
            this.mouse_dys.push( mouse_dy.push(current_mouse_pos[1], this.dt) );
        })

        this.linkForces.distance( this.relativeDistance ).strength( (link) => Math.min( link.stress * 1.3 / this.relativeDistance + 0.2, 1 ) )

        // gravity
        this.simulation.force("gravity", (alpha: number) => {
            for( const node of this.nodes.values() ){
                if( node instanceof SkillTreeDynamicNode ){
                    node.vy += GRAVITY * alpha * this.dt;
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
                        node.vx += (paddingX - node.x) * PADDING_FORCE * this.dt;
                    }
                    if( node.x > w - paddingX ){
                        node.vx -= (node.x - (w - paddingX)) * PADDING_FORCE * this.dt;
                    }
                    if( node.y < paddingY ){
                        node.vy += (paddingY - node.y) * PADDING_FORCE * this.dt;
                    }
                    if( node.y > h - paddingY ){
                        node.vy -= (node.y - (h - paddingY)) * PADDING_FORCE * this.dt;
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
                    node.vy += (targetY - node.y) * 0.03 * alpha * this.dt;
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

            this.resUniform = gl.getUniformLocation(program, 'u_resolution')!;

            const templateBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, templateBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, EDGE_VERTS, gl.STATIC_DRAW);
    
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

    
        this.simulation.velocityDecay(0.05);
        this.simulation.alphaDecay(0);
        this.simulation.alpha(0.25);


        const nodeResizeWatcher = new ResizeObserver(this.onNodesResized);
        nodeResizeWatcher.observe(this._someNode.html);

        const canvasResizeWatcher = new ResizeObserver(this.onCanvasResized);
        canvasResizeWatcher.observe(this.edgeContainer);
    }

    private *getRawEdgeData(): Generator<number, void, unknown> {
        const dpr = window.devicePixelRatio || 1;
        for( const edge of this.edges.values() ){
            yield edge.source.x * dpr;
            yield edge.source.y * dpr;
            yield edge.target.x * dpr;
            yield edge.target.y * dpr;
            yield edge.width    * dpr;
        }
    }

    public override requestRender(): void {
        super.requestRender();
    }

    public override render() {
        super.render();
        this.mouse_ticked = false;

        // Thanks to Anthropic's Claude (and all programmers it learned from) for this more optimized GPU instanced drawing of edges.
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.edgeBuffer);
        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, new Float32Array( this.getRawEdgeData() ));
        
        this.gl.clearColor(0, 0, 0, 0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        // the '6' here = 6 verts per edge (2 tris)
        this.gl.drawArraysInstanced(this.gl.TRIANGLES, 0, EDGE_VERTS.length / 2, this.edges.size);
    }

    public transformDragEventToSimulationCoords(v: Vec2) {
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