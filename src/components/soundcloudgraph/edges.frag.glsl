#version 300 es
precision highp float;

in vec3 v_color; // read from vertex shader

out vec4 fragColor;

void main() {
    fragColor = vec4(v_color, 1);
}