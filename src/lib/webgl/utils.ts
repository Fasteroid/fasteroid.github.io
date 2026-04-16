


export namespace WebGLUtils {

    // Credits:
    // - https://webglfundamentals.org/webgl/lessons/webgl-boilerplate.html
    // - Github Copilot
    // - Claude Sonnet 4.6

    export function createProgram(gl: WebGL2RenderingContext, fragmentSource: string, vertexSource: string ): WebGLProgram {
        const program = gl.createProgram();
        if (!program) { throw new Error('Failed to create program'); }

        const vertexShader = gl.createShader(gl.VERTEX_SHADER);
        if (!vertexShader) { throw new Error('Failed to create vertex shader'); }
        gl.shaderSource(vertexShader, vertexSource);
        gl.compileShader(vertexShader);
        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
            throw new Error('Failed to compile vertex shader: ' + gl.getShaderInfoLog(vertexShader));
        }

        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        if (!fragmentShader) { throw new Error('Failed to create fragment shader'); }
        gl.shaderSource(fragmentShader, fragmentSource);
        gl.compileShader(fragmentShader);
        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
            throw new Error('Failed to compile fragment shader: ' + gl.getShaderInfoLog(fragmentShader));
        }

        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            throw new Error('Failed to link program: ' + gl.getProgramInfoLog(program));
        }
        return program;
    }

    export function createTexture(gl: WebGL2RenderingContext, image: TexImageSource): WebGLTexture {
        const texture = gl.createTexture();
        if (!texture) { throw new Error('Failed to create texture'); }
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        return texture;
    }

    /**
     * Lookup table for sizes in bytes of certain units from WebGL
     */
    export const SIZE_LOOKUP = {
        [WebGL2RenderingContext.FLOAT]:          4,
        [WebGL2RenderingContext.UNSIGNED_BYTE]:  1,
        [WebGL2RenderingContext.BYTE]:           1,
        [WebGL2RenderingContext.UNSIGNED_SHORT]: 2,
        [WebGL2RenderingContext.SHORT]:          2,
        [WebGL2RenderingContext.UNSIGNED_INT]:   4,
        [WebGL2RenderingContext.INT]:            4,
        [WebGL2RenderingContext.HALF_FLOAT]:     2
    } as const;

    export type AttributeDescriptor = [
        name:    string,
        count:   number,
        type:    keyof typeof SIZE_LOOKUP,
    ]

    /**
    * Sets up the provided per-instance attributes (divisor=1) in order.  The stride and offsets are calculated automatically.
    * Assumes the correct VAO and buffer are already bound.
    * 
    * @param gl        - WebGL2 rendering context
    * @param program   - The compiled shader program to bind attributes against
    * @param attributes - Ordered list of attribute descriptors matching the buffer layout
    */
    export function setupInstanceAttributes(
        gl:         WebGL2RenderingContext,
        program:    WebGLProgram,
        attributes: AttributeDescriptor[],
    ): void {
        const stride = attributes.reduce((sum, attr) => sum + attr[1] * SIZE_LOOKUP[ attr[2] ], 0);
        let offset = 0;

        for (const attr of attributes) {
            const loc = gl.getAttribLocation(program, attr[0]);

            if (loc === -1) {
                console.warn(`Attribute "${attr[0]}" not found in shader program!!`);
            } 
            else {
                gl.enableVertexAttribArray(loc);
                gl.vertexAttribPointer(loc, attr[1], attr[2], false, stride, offset);
                gl.vertexAttribDivisor(loc, 1);
            }

            offset += attr[1] * SIZE_LOOKUP[attr[2]];
        }
    }
    
}