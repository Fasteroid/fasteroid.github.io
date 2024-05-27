
export class WebGLUtils {

    public static readonly DEFAULT_VERTEX_SHADER = `attribute vec4 a_position; void main() { gl_Position = a_position; }`;

    // Credits:
    // - https://webglfundamentals.org/webgl/lessons/webgl-boilerplate.html
    // - Github Copilot
    public static createProgram(gl: WebGL2RenderingContext, fragmentSource: string, vertexSource: string = WebGLUtils.DEFAULT_VERTEX_SHADER ): WebGLProgram {
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

    public static setup2DFragmentShader(gl: WebGL2RenderingContext, program: WebGLProgram, canvas: HTMLCanvasElement): void {
        const positionAttributeLocation = gl.getAttribLocation(program, "a_position");

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1, -1,
             1, -1,
            -1,  1,
            -1,  1,
             1, -1,
             1,  1,
        ]), gl.STATIC_DRAW);
    
        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

        gl.useProgram(program);

        // Set resolution uniform
        const resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
        gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
    }
}