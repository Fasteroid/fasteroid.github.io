export const VERTEX_SHADER = 
`#version 300 es

in vec2 a_position;
in vec4 a_color;
uniform vec2 u_resolution;

out vec4 v_color;

void main() {
    vec2 zeroToOne = a_position / u_resolution;
    vec2 zeroToTwo = zeroToOne * 2.0;
    vec2 clipSpace = zeroToTwo - 1.0;
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
    v_color = a_color;
}`

export const FRAGMENT_SHADER = 
`#version 300 es

precision highp float;

in vec4 v_color;
out vec4 outColor;

void main() {
    outColor = v_color;
}`