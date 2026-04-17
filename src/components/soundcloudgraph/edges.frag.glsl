#version 300 es
precision highp float;

// read from vertex shader
in vec3 v_color;
in vec3 v_barycentric;

out vec4 fragColor;

float lightFalloff(float dist) {
    return dist * dist * dist * 16.0;
}

void main() {
    float dist = min(v_barycentric.y, v_barycentric.z);
    float a = lightFalloff(dist);

    fragColor = vec4(v_color * a, 1);
}