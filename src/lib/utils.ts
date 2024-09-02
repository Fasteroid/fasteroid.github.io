// Learned this trick in lua, I wonder if it makes things faster in JS too?
const sqrt = Math.sqrt;

/** This doesn't really mean it's immutable, but it will prevent accidental changes via the many mutator methods. */
export type ImmutableVec2 = Omit<Vec2, 'add' | 'sub' | 'addV' | 'subV' | 'setTo' | 'scaleBy' | 'normalize' | 'pivot90CCW' | 'pivot90CW' | 'rotate' | 'x' | 'y'> & { readonly x: number, readonly y: number };

/**
 * NOTE: For memory efficiency, most of these methods self-modify.
 *       Access the 'copy' field to get a new 
 */
export class Vec2 {

    x: number;
    y: number;
    
    constructor(x: number = 0, y: number = 0){
        this.x = x;
        this.y = y;
    }
    
    length(): number {
        return sqrt(this.x**2 + this.y**2);
    }
    
    distance(that: ImmutableVec2): number {
        return sqrt( this.distanceSqr(that) );
    }

    normalize(): Vec2 {
        const length = this.length();
        this.scaleBy(1 / length);
        return this;
    }

    clampLength(min: number, max: number): Vec2 {
        const length = this.length();
        const new_length = clamp(length, min, max);
        this.scaleBy( new_length / length );
        return this;
    }

    distanceSqr(that: ImmutableVec2): number {
        return (this.x - that.x)**2 + (this.y - that.y)**2;
    }

    dot(that: ImmutableVec2): number {
        return this.x * that.x + this.y * that.y;
    }

    add(x: number, y: number): Vec2 {
        this.x += x;
        this.y += y;
        return this;
    }

    sub(x: number, y: number): Vec2 {
        this.x -= x;
        this.y -= y;
        return this;
    }

    addV(that: ImmutableVec2): Vec2 {
        return this.add(that.x, that.y);
    }

    subV(that: ImmutableVec2): Vec2 {
        return this.sub(that.x, that.y);
    }

    get copy() {
        return new Vec2(this.x, this.y)
    }

    setTo(x: number, y: number): Vec2 {
        this.x = x;
        this.y = y;
        return this;
    }

    scaleBy(mag: number): Vec2{
        return this.setTo(this.x * mag, this.y * mag)
    }

    rotate(angle: number): Vec2{
        const x = this.x;
        const y = this.y;
        this.x = x * Math.cos(angle) - y * Math.sin(angle);
        this.y = x * Math.sin(angle) + y * Math.cos(angle);
        return this;
    }

    pivot90CCW(): Vec2 {
        const x = this.x;
        this.x = -this.y;
        this.y = x;
        return this;
    }

    pivot90CW(): Vec2 {
        const x = this.x;
        this.x = this.y;
        this.y = -x;
        return this;
    }

}

export class Color {
    
    r: number;
    g: number;
    b: number;
    a: number;

    constructor(r: number = 0, g: number = 0, b: number = 0, a: number = 1){
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
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

    has(k1: K, k2: K): boolean {
        return this.mapMap.get(k1)?.has(k2) ?? false;
    }

    get(k1: K, k2: K): V | undefined {
        return this.mapMap.get(k1)?.get(k2);
    }

    delete(k1: K, k2: K){
        this.mapMap.get(k1)?.delete(k2);
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

export class Set2D<K> {

    private setSet: Map<K, Set<K>> = new Map<K, Set<K>>();

    add(k1: K, k2: K){
        let inner: Set<K>;
        if(!this.setSet.has(k1)){
            inner = new Set<K>();
            this.setSet.set(k1, inner);
        }
        else {
            inner = this.setSet.get(k1)!;
        }
        inner.add(k2);
    }

    has(k1: K, k2: K): boolean {
        return this.setSet.get(k1)?.has(k2) ?? false;
    }

    delete(k1: K, k2: K){
        this.setSet.get(k1)?.delete(k2);
    }

    forEach(callback: (k1: K, k2: K) => void){
        this.setSet.forEach((inner, k1) => {
            inner.forEach(k2 => {
                callback(k1, k2);
            })
        })
    }

    keys(): [K, K][] {
        let ret: [K, K][] = [];
        this.forEach((k1, k2) => ret.push([k1, k2]));
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
    console.error(msg);
    throw msg;
}

/** 
 * Property decorator.
 * 
 * Once the property is set, it is locked in and cannot be changed.
*/
export function SetOnce() {
    return function(target: any, key: string) {
        let dirty = false;
        let val = target[key];
        Object.defineProperty(target, key, {
            get: () => val,
            set: (v: any) => {
                if(dirty) throw `Property ${key} is read-only`;
                val = v;
                dirty = true;
            }
        })
    }
}