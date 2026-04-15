

/**
 * Color stuff.
 * @author Fasteroid
 * @stackoverflow https://stackoverflow.com/a/17243070/15204995
 */
export class Color {

    static BLACK: Readonly<Color> = new Color(0, 0, 0, 1);
    
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

    /**
     * @param h - hue (0-1)
     * @param s - saturation (0-1)
     * @param v - value (0-1)
     * @param a - alpha (0-1)
     * @stackoverflow https://stackoverflow.com/a/17243070/15204995
     */
    static fromHSV(h: number, s: number, v: number, a: number = 1): Color {
        let r, g, b, i, f, p, q, t;
        i = Math.floor(h * 6);
        f = h * 6 - i;
        p = v * (1 - s);
        q = v * (1 - f * s);
        t = v * (1 - (1 - f) * s);
        switch (i % 6) {
            case 0: r = v, g = t, b = p; break;
            case 1: r = q, g = v, b = p; break;
            case 2: r = p, g = v, b = t; break;
            case 3: r = p, g = q, b = v; break;
            case 4: r = t, g = p, b = v; break;
            case 5: r = v, g = p, b = q; break;
        }
        return new Color(r, g, b, a);
    }

    /**
     * @stackoverflow https://stackoverflow.com/a/17243070/15204995
     * @returns all values are in the range 0-1
     */
    toHSV(): { h: number, s: number, v: number } {
        let max = Math.max(this.r, this.g, this.b), 
            min = Math.min(this.r, this.g, this.b),
            d = max - min,
            h = 0,
            s = (max === 0 ? 0 : d / max),
            v = max / 255;
    
        switch (max) {
            case min: h = 0; break;
            case this.r: h = (this.g - this.b) + d * (this.g < this.b ? 6: 0); h /= 6 * d; break;
            case this.g: h = (this.b - this.r) + d * 2; h /= 6 * d; break;
            case this.b: h = (this.r - this.g) + d * 4; h /= 6 * d; break;
        }
    
        return {
            h: h,
            s: s,
            v: v
        };
    }

}

/**
 * Clamps a number (even NaN) between two values.
 * @author Fasteroid
 */
export function clamp(n: number, min: number, max: number): number {
    n = isNaN(n) ? 0 : n;
    const ret = (n > max ? max : (n < min ? min : n));
    return ret;
}

export function lerp(a: number, b: number, t: number): number {
    return a * (1 - t) + b * t;
}

/**
 * Damped harmonic oscillator, as an easing function.  Bakes one with the constants precomputed.
 * @author Claude Sonnet 4.6, Github Copilot, Fasteroid
 */
export function makeHarmonicOscillator(damping = 0.35, frequency = 12) {
    const wd       = frequency * Math.sqrt(1 - damping * damping);
    const decay    = damping * frequency;
    const sinScale = damping / Math.sqrt(1 - damping * damping);

    const f1 = (t: number) => 1 - Math.exp(-decay * t) * (Math.cos(wd * t) + sinScale * Math.sin(wd * t));
    const offset = f1(0);
    const stretch = f1(1) - offset;
    return (t: number) => (f1(t) - offset) / stretch;
}


/**
 * 2D map using a pair of keys.
 * @author Fasteroid
 */
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

    *values() {
        for( let inner of this.mapMap.values() )
            for( let v of inner.values() )
                yield v;
    }

    *keys() {
        for( let [k1, inner] of this.mapMap.entries() )
            for( let k2 of inner.keys() )
                yield [k1, k2] as [K, K];
    }


    public get size(): number {
        let size = 0;
        for( let inner of this.mapMap.values() )
            size += inner.size;
        return size;
    }

}

/**
 * Helper method for creating a shader program.
 */
export function compileShader(ctx: WebGL2RenderingContext, type: GLenum, source: string) {
    const shader = ctx.createShader(type);

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
 * Once the property is set, it is locked in and cannot be changed.
 * @author Fasteroid
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


/**
 * Builds a function from an existing one.  The new one remembers the result of previous calls.
 * Be careful passing object references, and remember this can leak memory.
 * @param fn - victim
 * @author Fasteroid
 */
export function cacheWrap<I, O>(fn: (i: I) => O): (i: I) => O {
    const cache = new Map<I, O>();
    return ((i: I): O => {
        if( cache.has(i) ) return cache.get(i)!;
        const o = fn(i)
        cache.set(i, o)
        return o;
    }) as (i: I) => O
}



/**
 * Takes in an array of {@linkcode T}, returns an object containing the original array's contents, grouped by the result of {@linkcode group}.
 * @author github copilot
 */
export function groupBy<T, K extends number | string>( arr: T[], group: (t: T) => K ): Map<K, T[]> {
    const map = new Map<K, T[]>();
    for( const item of arr ){
        const key = group(item);
        if( !map.has(key) ){
            map.set(key, []);
        }
        map.get(key)?.push(item);
    }
    return map;
}


/**
 * Replaces text in a string, according to one regex, but only if it doesn't match another regex.
 * @param text       - victim
 * @param sentinel   - any number of groups to ignore
 * @param innerRegex - what you actually want to match
 * @param replace    - the function that will be called to replace the matches
 * @author Fasteroid
 */
export function shortCircuitReplace( text: string, sentinel: RegExp, innerRegex: RegExp, replace: (...args: string[]) => string ){
    let argShift = 1;

    let lastWasEscape = false;
    for( let char of sentinel.source ){

        if( lastWasEscape ){
            lastWasEscape = false;
            continue;
        }

        if( char === "\\" ){
            lastWasEscape = true;
            continue;
        }

        if( char === "(" ){
            argShift++;
        }
        
    }

    let matcher = new RegExp(`${sentinel.source}|${innerRegex.source}`,"g")

    return text.replace(matcher, function(){
        let shiftedArguments = [...arguments].slice(argShift, arguments.length - argShift); // we'll pass these on to replace

        for( let i = 1; i < argShift; i++ ){
            if( arguments[i] ){ return arguments[0] } // oops, we matched a sentinel
        }

        return replace.call(globalThis, ...shiftedArguments); // we matched the inner regex and no sentinels, so we can replace
    })
}

/**
 * Should be self-explanatory.
 * @author Fasteroid
 */
export function replaceOutsideHTMLTags( text: string, innerRegex: RegExp, replace: (...args: string[]) => string ){
    return shortCircuitReplace(text, /(\<.*?\>.*?\<.*?\>)/, innerRegex, replace)
}


export async function loadDynamicJSON<T>(branch: string, file: string): Promise<T> {
    let resp = await fetch(`https://raw.githubusercontent.com/Fasteroid/fasteroid.github.io/${branch}/${file}`)
    let json = await resp.text();

    return JSON.parse(json)
}

export class RollingAverage {
    private buffer: number[] = [];
    private ptr: number = 0;
    private value: number | undefined = 0;
    constructor(public readonly size: number) {}

    /**
     * Pushed a value into the buffer, up to a size of {@linkcode size}, then starts overwriting old values.
     */
    public push(value: number) {
        if( this.buffer.length < this.size ){
            this.buffer.push(value);
        }
        else {
            this.buffer[this.ptr] = value;
            this.ptr = (this.ptr + 1) % this.size;
        }
        this.value = undefined;
    }

    private compute() {
        if( this.buffer.length === 0 ) return 0;
        const sum = this.buffer.reduce((a, b) => a + b, 0);
        return sum / this.buffer.length;
    }

    /**
     * Gets (or computes) the average of the values in the buffer.
     */
    public get(): number {
        return this.value ??= this.compute();
    }
}

export class Derivative {
    private lastValue!: number;

    /**
     * Pushes a value into the derivative calculator, and returns the derivative (change) since the last value was pushed.
     */
    public push(value: number, dt: number): number {
        if( dt === 0 ) return 0; // bail
        this.lastValue ??= value; // just in case; don't want undefined here.
        const derivative = (value - this.lastValue) / dt;
        this.lastValue = value;
        return derivative;
    }
}

export function nextMicrotask(): Promise<void> {
    return new Promise( (resolve) => queueMicrotask(resolve) )
}