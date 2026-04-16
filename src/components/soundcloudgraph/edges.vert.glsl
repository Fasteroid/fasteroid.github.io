#version 300 es
precision highp float;

// Template vertices - defines the shape of one edge (6 vertices = 2 triangles)
// These are positions from 0 to 1 along the edge, and -0.5 to 0.5 perpendicular
in vec2 a_templatePosition;

// Per-instance attributes - one per edge
in vec2 a_startPoint;
in vec2 a_endPoint;
in float a_width;
in vec3 a_color;

// we need to output color for the fragment shader to read
out vec3 v_color;

uniform vec2 u_resolution;
uniform vec3 u_panzoom;

void main() {
    // Calculate the edge direction and perpendicular
    vec2 direction = normalize(a_endPoint - a_startPoint);
    vec2 perpendicular = vec2(-direction.y, direction.x);
    
    // The template position tells us where along/across the edge we are
    // x: 0 = start, 1 = end
    // y: -0.5 = one side, 0.5 = other side
    vec2 alongEdge = mix(a_startPoint, a_endPoint, a_templatePosition.x);
    vec2 acrossEdge = perpendicular * a_templatePosition.y * a_width;
    
    vec2 position = alongEdge + acrossEdge;

    position = position + u_panzoom.xy / u_panzoom.z;
    position = position * u_panzoom.z;

    position = position + u_resolution.xy * 0.5;
    
    // Convert from pixel coordinates to clip space (-1 to 1)
    vec2 clipSpace = (position / u_resolution) * 2.0 - 1.0;
    clipSpace.y *= -1.0; // Flip Y axis
    
    gl_Position = vec4(clipSpace, 0.0, 1.0);
    v_color = a_color;
}