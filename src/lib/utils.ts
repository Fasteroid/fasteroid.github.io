// Learned this trick in lua, I wonder if it makes things faster in JS too?
const sqrt = Math.sqrt;

export class Vec2 {

    x: number;
    y: number;
    
    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }
    
    length(): number {
        return sqrt(this.x**2 + this.y**2);
    }
    
    distance(that: Vec2): number {
        return sqrt(this.distanceSqr(that));
    }

    normalize(){
        const length = this.length();
        this.scaleBy(1 / length);
        return length
    }

    distanceSqr(that: Vec2): number {
        return (this.x - that.x)**2 + (this.y - that.y)**2;
    }

    dot(that: Vec2): number {
        return this.x * that.x + this.y * that.y;
    }

    addTo(x: number, y: number){
        this.x += x;
        this.y += y;
    }

    addToV(that: Vec2){
        this.addTo(that.x, that.y);
    }

    clone() {
        return new Vec2(this.x, this.y)
    }

    setTo(x: number, y: number){
        this.x = x;
        this.y = y;
    }

    scaleBy(mag: number){
        this.setTo(this.x * mag, this.y * mag)
    }

}

export function clamp(n: number, min: number, max: number): number {
    const ret = (n > max ? max : (n < min ? min : n));
    return isNaN(ret) ? 0 : ret;
}

export class Map2D<K, V> {

    private mapMap = new Map<K, Map<K, V>>();

    set(k1: K, k2: K, v: V){
        let inner: Map<K, V>;
        if(!this.mapMap.has(k1)){
            inner = new Map<K, V>();
            this.mapMap.set(k1, inner);
        }
        else {
            inner = this.mapMap.get(k1)!;
        }
        inner.set(k2, v);
    }

    get(k1: K, k2: K): V | undefined {
        return this.mapMap.get(k1)?.get(k2);
    }

    forEach(callback: (v: V, k1: K, k2: K) => void){
        this.mapMap.forEach((inner, k1) => {
            inner.forEach((v, k2) => {
                callback(v, k1, k2);
            })
        })
    }

    values(): V[] {
        let ret: V[] = [];
        this.forEach(v => ret.push(v));
        return ret;
    }

    keys(): [K, K][] {
        let ret: [K, K][] = [];
        this.forEach((_, k1, k2) => ret.push([k1, k2]));
        return ret;
    }

}

export function compileShader(ctx: WebGL2RenderingContext, type: GLenum, source: string) {
    const shader = ctx.createShader(type);

    console.log(shader)

    if( shader === null ) throw "Failed to compile shader";

    ctx.shaderSource(shader, source);
    ctx.compileShader(shader);

    if( !ctx.getShaderParameter(shader, ctx.COMPILE_STATUS) ){
        console.error('An error occurred compiling the shaders: ' + ctx.getShaderInfoLog(shader));
        throw "Failed to compile shader";
    }

    return shader;
}

export function die(msg: string): never {
    throw msg;
}