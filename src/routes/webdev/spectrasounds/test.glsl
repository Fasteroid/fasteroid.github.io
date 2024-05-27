
precision mediump float;
uniform vec2 u_resolution;
void mainImage(out vec4 fragColor, in vec2 fragCoord);

void main() {
    vec2 fragCoord = gl_FragCoord.xy;
    vec4 fragColor;
    mainImage(fragColor, fragCoord);
    gl_FragColor = fragColor;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / u_resolution;
    fragColor = vec4(uv, 0.5 + 0.5 * sin(uv.x * 10.0), 1.0);
}
