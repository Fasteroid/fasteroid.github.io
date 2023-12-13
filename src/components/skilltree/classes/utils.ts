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