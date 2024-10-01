
import { parse } from "svelte/compiler";
import { clamp, compileShader, Map2D, die, Vec2, Color } from "../../lib/utils";
import type { GraphEdgeData, GraphNodeData, GraphDataset } from "./interfaces";
import { FRAGMENT_SHADER, VERTEX_SHADER } from "./shaders";
import type { PanZoom, PanZoomOptions } from "panzoom";
import Panzoom from "panzoom";


type WidthHeight = { width: number, height: number };

/**
 * This new class encompasses the most basic functionalities
 * of the old SkillTreeNodeManager class.
 * 
 * @param NodeData - Minimum specs for node data in this graph.
 * @param EdgeData - Minimum specs for edge data in this graph.
 * @param Edge - Minimum specs for edge methods in this graph.
 * @param Node - Minimum specs for node methods in this graph.
 */
export abstract class GraphManager<
    NodeData extends GraphNodeData,
    EdgeData extends GraphEdgeData,
    Edge     extends GraphEdge<NodeData, EdgeData, Node>,
    Node     extends GraphNode<NodeData, EdgeData, Edge>
> {
    
    public readonly template:  HTMLElement;

    public readonly nodeContainer: HTMLElement;
    public readonly edgeContainer: HTMLCanvasElement;

    public readonly nodes: Map<string, Node>   = new Map();
    public readonly edges: Map2D<string, Edge> = new Map2D(); // from, to

    public readonly panzoom?: PanZoom;

    private _selfBox?: DOMRect;
    public get selfBox(): DOMRect {
        return this._selfBox ??= this.nodeContainer.getBoundingClientRect();
    }

    private _parentBox?: DOMRect;
    public get parentBox(): DOMRect {
        return this._parentBox ??= this.nodeContainer.parentElement!.getBoundingClientRect();
    }

    private _selfComputedSize?: { width: number, height: number };
    public get selfComputedSize(): WidthHeight {
        if(this._selfComputedSize === undefined){
            let style = window.getComputedStyle(this.nodeContainer);
            this._selfComputedSize = {
                width:  parseFloat(style.width),
                height: parseFloat(style.height)
            }
        }
        return this._selfComputedSize;
    }

    protected /*virtual*/ get vertexShader(): string {
        return VERTEX_SHADER
    }

    protected /*virtual*/ get fragmentShader(): string {
        return FRAGMENT_SHADER
    }

    private recalculateStyle(){
        this._selfBox = undefined;
        this._parentBox = undefined;
        this._selfComputedSize = undefined;
        this.selfBox;
        this.parentBox;
        this.selfComputedSize;
    }

    private _render = () => {
        this.simulate();
        window.requestAnimationFrame( () => {
            window.setTimeout(this._render, 16); // 60fps
            this.render()
        });
    }

    // ----- webgl -----
    public readonly gl_ctx:     WebGL2RenderingContext;
    private gl_program: WebGLProgram;

    private gl_positionAttributeLocation: GLint;
    private gl_resolutionUniformLocation: WebGLUniformLocation;
    private gl_colorAttributeLocation:    GLint;

    private gl_colorBuffer:               WebGLBuffer;
    private gl_vertexBuffer:              WebGLBuffer;
    private gl_vertexArray:               WebGLVertexArrayObject;
    // -----------------

    constructor(
        template: HTMLElement, 
        nodeContainer: HTMLElement,
        edgeContainer: HTMLCanvasElement,
        data: GraphDataset<NodeData>,
        panzoom?: PanZoomOptions
    ){
        this.template      = template;
        this.nodeContainer = nodeContainer;
        this.edgeContainer = edgeContainer;

        if(panzoom){
            this.panzoom = Panzoom(nodeContainer, panzoom);

            // lmao no types for this
            this.panzoom.on("transform", () => this.render());
        }

        for(const nodeData of data.nodes){
            if( nodeData === null || nodeData === undefined ) continue;
            this.nodes.set(nodeData.id, this.createNode(nodeData));
        }

        for(const edgeData of data.edges){
            let edge = this.edges.get(edgeData.to, edgeData.from);
            if( edge ){ // does the other direction exist?
                edge.bidirectional = true; // mark as bidirectional; no need to create a new edge
            }
            else {
                edge = this.createEdge(edgeData);

                const fromNode = this.nodes.get(edgeData.from);
                const toNode   = this.nodes.get(edgeData.to);

                if( fromNode === null || fromNode === undefined || toNode === null || toNode === undefined ) {
                    console.warn("Bad edge: ", edgeData);
                    continue;
                }

                fromNode.edges.push(edge);
                toNode.edges.push(edge);
                this.edges.set(edgeData.from, edgeData.to, edge);
            }
        }

        this.oldH = this.nodeContainer.clientHeight;
        this.oldW = this.nodeContainer.clientWidth;

        requestAnimationFrame(this._render);

        window.addEventListener('resize', () => {
            this.recalculateStyle();
            this.handleResize();
        });

        this.gl_ctx = this.edgeContainer.getContext("webgl2", {preMultipliedAlpha: false}) as WebGL2RenderingContext;

        const vertex   = compileShader(this.gl_ctx, this.gl_ctx.VERTEX_SHADER, this.vertexShader);
        const fragment = compileShader(this.gl_ctx, this.gl_ctx.FRAGMENT_SHADER, this.fragmentShader);

        this.gl_program = this.gl_ctx.createProgram() ?? die("Failed to create program");
        this.gl_ctx.attachShader(this.gl_program, vertex);
        this.gl_ctx.attachShader(this.gl_program, fragment);
        this.gl_ctx.linkProgram(this.gl_program);

        if( !this.gl_ctx.getProgramParameter(this.gl_program, this.gl_ctx.LINK_STATUS) ){
            die("Failed to link program: " + this.gl_ctx.getProgramInfoLog(this.gl_program));
        }
    
        this.gl_positionAttributeLocation = this.gl_ctx.getAttribLocation(this.gl_program,  "a_position");
        this.gl_colorAttributeLocation    = this.gl_ctx.getAttribLocation(this.gl_program,  "a_color")
        this.gl_resolutionUniformLocation = this.gl_ctx.getUniformLocation(this.gl_program, "u_resolution") ?? die("Failed to get resolution uniform location");    

        this.gl_vertexBuffer = this.gl_ctx.createBuffer()      ?? die("Failed to create position buffer");
        this.gl_colorBuffer  = this.gl_ctx.createBuffer()      ?? die("Failed to create color buffer");
        this.gl_vertexArray  = this.gl_ctx.createVertexArray() ?? die("Failed to create vertex array");

        // position buffer
        this.gl_ctx.bindVertexArray(this.gl_vertexArray);
        this.gl_ctx.bindBuffer(this.gl_ctx.ARRAY_BUFFER, this.gl_vertexBuffer);
        this.gl_ctx.enableVertexAttribArray(this.gl_positionAttributeLocation);
        this.gl_ctx.vertexAttribPointer(this.gl_positionAttributeLocation, 2, this.gl_ctx.FLOAT, false, 0, 0);        

        // color buffer
        this.gl_ctx.bindVertexArray(this.gl_vertexArray);
        this.gl_ctx.bindBuffer(this.gl_ctx.ARRAY_BUFFER, this.gl_colorBuffer);
        this.gl_ctx.enableVertexAttribArray(this.gl_colorAttributeLocation);
        this.gl_ctx.vertexAttribPointer(this.gl_colorAttributeLocation, 4, this.gl_ctx.FLOAT, false, 0, 0);
    }

    protected abstract createNode(data: NodeData): Node;

    protected abstract createEdge(data: GraphEdgeData): Edge;

    private oldW: number;
    private oldH: number;
    protected handleResize(){
        this.nodes.forEach( node => {
            node.setPos(
                node.pos.x * this.nodeContainer.clientWidth / this.oldW,
                node.pos.y * this.nodeContainer.clientHeight / this.oldH
            )
        });
        this.nodes.forEach( node => node.render() );
        this.oldW = this.nodeContainer.clientWidth;
        this.oldH = this.nodeContainer.clientHeight;

        this.edgeContainer.width  = this.nodeContainer.clientWidth;
        this.edgeContainer.height = this.nodeContainer.clientHeight
    }

    public /*virtual*/ preRender(){ };
    private render(){
        this.preRender();
        this.recalculateStyle();

        this.nodes.forEach( node => node.render() );

        this.gl_ctx.viewport(0, 0, this.selfComputedSize.width, this.selfComputedSize.height);

        this.gl_ctx.clearColor(0.0, 0.0, 0.0, 0.0);  // White background
        this.gl_ctx.clear(this.gl_ctx.COLOR_BUFFER_BIT);
    
        this.gl_ctx.useProgram(this.gl_program);
        this.gl_ctx.bindVertexArray(this.gl_vertexArray);
    
        this.gl_ctx.uniform2f(this.gl_resolutionUniformLocation, this.parentBox.width, this.parentBox.height);
    
        const positions: number[] = [];
        const colors:    number[] = [];
        for(const edge of this.edges.values()){
            for(let vert of edge.verts){
                vert = this.toWorld(vert.x, vert.y);
                positions.push(vert.x, vert.y);
                colors.push(edge.color.r, edge.color.g, edge.color.b, edge.color.a);
            }
        }

        this.gl_ctx.bindBuffer(this.gl_ctx.ARRAY_BUFFER, this.gl_vertexBuffer);
        this.gl_ctx.bufferData(this.gl_ctx.ARRAY_BUFFER, new Float32Array(positions), this.gl_ctx.DYNAMIC_DRAW);

        this.gl_ctx.bindBuffer(this.gl_ctx.ARRAY_BUFFER, this.gl_colorBuffer);
        this.gl_ctx.bufferData(this.gl_ctx.ARRAY_BUFFER, new Float32Array(colors), this.gl_ctx.DYNAMIC_DRAW);
    
        this.gl_ctx.drawArrays(this.gl_ctx.TRIANGLES, 0, positions.length / 2);  
    }

    public /*virtual*/ preSimulate(){};
    private simulate(){
        this.preSimulate();
        this.nodes.forEach( node => node.doForces() );
        this.edges.forEach( edge => edge.doForces() );
        this.nodes.forEach( node => node.doPositioning() );
    }

    public toWorld(x: number, y: number): Vec2 {
        const thisRect = this.selfBox;
        const parentRect = this.parentBox;
        const style = this.selfComputedSize;

        const scaleX = thisRect.width / style.width;
        const scaleY = thisRect.height / style.height;

        return new Vec2(
            x * scaleX + thisRect.left - parentRect.left,
            y * scaleY + thisRect.top - parentRect.top
        );
    }

    public toLocal(x: number, y: number): Vec2 {
        const thisRect = this.selfBox;
        const parentRect = this.parentBox;
        const style = this.selfComputedSize;

        const scaleX = thisRect.width / style.width;
        const scaleY = thisRect.height / style.height;

        return new Vec2(
            (x - thisRect.left + parentRect.left) / scaleX,
            (y - thisRect.top  + parentRect.top)  / scaleY
        );
    }

}

export abstract class GraphEdge<
    NodeData extends GraphNodeData,
    EdgeData extends GraphEdgeData,
    Node     extends GraphNode<NodeData, EdgeData, GraphEdge<NodeData, EdgeData, Node>>
> {

    public readonly from: Node;
    public readonly to:   Node;

    public bidirectional: boolean = false;

    public abstract width: number;
    public abstract color: Color;

    constructor(
        manager: GraphManager<
                    NodeData, 
                    EdgeData, 
                    GraphEdge<NodeData, EdgeData, Node>, 
                    GraphNode<NodeData, EdgeData, GraphEdge<NodeData, EdgeData, Node>>
                >,
        data:    EdgeData
    ){
        this.from = manager.nodes.get(data.from) as Node;
        this.to   = manager.nodes.get(data.to)   as Node;
    }

    /**
     * Called once per simulation frame; updates velocity via {@link applyForce} calls.
     */
    public abstract doForces(): void;

    public get normal(): Vec2 {
        let ret = this.to.pos.copy
        ret.subV(this.from.pos);
        ret.normalize();
        return ret;
    }

    /** Two counterclockwise triangles */
    public get verts(): Vec2[] {

        const to   = this.to.pos;
        const from = this.from.pos;

        const norm = this.normal;
        norm.scaleBy(this.width / 2);

        const offset = norm.copy;
        offset.pivot90CCW();

        return [
            to.copy.addV(offset),
            from.copy.subV(offset),
            from.copy.addV(offset),

            from.copy.subV(offset),
            to.copy.addV(offset),
            to.copy.subV(offset),
        ]

    }

}

/**
 * This new class encompasses the most basic functionalities 
 * of the old SkillTreeNode class.
 * 
 * This should be enough to get a simulation running.
 */
export abstract class GraphNode<
    NodeData extends GraphNodeData, 
    EdgeData extends GraphEdgeData,
    Edge     extends GraphEdge<NodeData, EdgeData, GraphNode<NodeData, EdgeData, Edge>>
>{
    protected data: NodeData;

    public pos: Vec2 = new Vec2();
    public vel: Vec2 = new Vec2();

    public readonly html: HTMLElement;
    public readonly id:   string;

    public readonly edges: Edge[] = [];

    public readonly style:   CSSStyleDeclaration;

    constructor(
        public readonly manager: GraphManager<
            NodeData,
            EdgeData,
            Edge,
            GraphNode<NodeData, EdgeData, Edge>
        >, 
        data: NodeData
    ){
        this.manager     = manager;
        this.id          = data.id;
        this.html        = manager.template.cloneNode(true) as HTMLElement;
        this.html.hidden = false;
        this.html.id     = "";
        this.style       = this.html.style;

        this.data        = data;

        this.manager.nodeContainer.appendChild(this.html);
    }

    /**
     * Called once per simulation frame; updates velocity via {@link applyForce} calls.
     * You should not apply edge-derived forces here; the manager does that for you.
     */
    public abstract doForces(): void;

    /**
     * Called after {@link doForces} to update position based on velocity.
    */ 
    public doPositioning(){
        this.vel.scaleBy(0.99)
        this.pos.addV(this.vel);
        this.clampToContainer();
    }

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
        this.vel.add(x, y);
    }

    /**
     * Same as old render method.
     */
    public render(){
        // I know I could use percent here, but that might make the text blurry.  This ensures it's always integer pixels.
        this.style.transform = `translate(
            ${Math.round(this.pos.x)}px, 
            ${Math.round(this.pos.y)}px
        )
        translate(-50%, -50%)`;
    }

    public clampToContainer(){
        this.setPos(this.pos.x, this.pos.y);
    }

}