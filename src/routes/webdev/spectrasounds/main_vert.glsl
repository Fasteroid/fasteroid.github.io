#version 300 es

in vec4  a_position;
out vec2 v_texCoord;

void main() {
    gl_Position = a_position;
    v_texCoord = (a_position.xy + 1.0) / 2.0;
}