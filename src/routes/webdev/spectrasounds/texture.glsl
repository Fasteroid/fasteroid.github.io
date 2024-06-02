
precision highp float;

uniform vec2      u_resolution;
uniform sampler2D u_texture;

void mainImage(out vec4 fragColor, in vec2 fragCoord);

void main() {
    vec2 fragCoord = gl_FragCoord.xy;
    vec4 fragColor;
    mainImage(fragColor, fragCoord);
    gl_FragColor = fragColor;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / u_resolution;
    fragColor = texture2D(u_texture, uv);
}
