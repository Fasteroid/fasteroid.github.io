import { clamp } from "./utils";

// Learned this trick in lua, I wonder if it makes things faster in JS too?
const sqrt = Math.sqrt;

/** This doesn't really mean it's immutable, but it will prevent accidental changes via the many mutator methods. */
export type ImmutableVec2 = Omit<Vec2, 'add' | 'sub' | 'addV' | 'subV' | 'setTo' | 'scaleBy' | 'normalize' | 'pivot90CCW' | 'pivot90CW' | 'rotate' | 'x' | 'y'> & { readonly x: number, readonly y: number };

/**
 * NOTE: For memory efficiency, most of these methods self-modify.
 *       Access the 'copy' field to get a new one.
 */
export class Vec2 {

    static readonly ZERO: ImmutableVec2 = new Vec2(0, 0);

    private _x: number;
    private _y: number;

    public get x() { return this._x; }
    public get y() { return this._y; }
    public set x(v: number) { this._x = v; this._length = undefined; }
    public set y(v: number) { this._y = v; this._length = undefined; }
    
    constructor(x: number = 0, y: number = 0){
        this._x = x;
        this._y = y;
    }
    
    private _length: number | undefined;
    length(): number {
        return this._length ??= sqrt(this.x**2 + this.y**2);
    }
    
    distance(that: ImmutableVec2): number {
        return sqrt( this.distanceSqr(that) );
    }

    normalize(): Vec2 {
        const length = this.length();
        this.scaleBy(1 / length);
        this._length = 1;
        return this;
    }

    clampLength(min: number, max: number): Vec2 {
        const length = this.length();
        const new_length = clamp(length, min, max);
        this._length = new_length;
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
        this._x += x;
        this._y += y;
        this._length = undefined;
        return this;
    }

    sub(x: number, y: number): Vec2 {
        this._x -= x;
        this._y -= y;
        this._length = undefined;
        return this;
    }

    addV(that: ImmutableVec2): Vec2 {
        return this.add(that.x, that.y);
    }

    subV(that: ImmutableVec2): Vec2 {
        return this.sub(that.x, that.y);
    }

    get copy() {
        let ret = new Vec2(this.x, this.y);
        ret._length = this._length;
        return ret;
    }

    setTo(x: number, y: number): Vec2 {
        this._x = x;
        this._y = y;
        this._length = undefined;
        return this;
    }

    setToV(other: Vec2){
        this._x      = other._x;
        this._y      = other._y;
        this._length = other._length;
    }

    scaleBy(mag: number): Vec2 {
        this._length = this._length !== undefined ? this._length * mag : undefined;
        this._x *= mag;
        this._y *= mag;
        return this;
    }

    rotate(angle: number): Vec2 {
        const x = this.x;
        const y = this.y;
        this._x = x * Math.cos(angle) - y * Math.sin(angle);
        this._y = x * Math.sin(angle) + y * Math.cos(angle);
        return this;
    }

    pivot90CCW(): Vec2 {
        const x = this.x;
        this._x = -this.y;
        this._y = x;
        return this;
    }

    pivot90CW(): Vec2 {
        const x = this.x;
        this._x = this.y;
        this._y = -x;
        return this;
    }

    extract(): [number, number] {
        return [this.x, this.y];
    }

}