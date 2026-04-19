#version 300 es
precision highp float;

uniform float u_time;

in vec3 v_startcolor;
in vec3 v_endcolor;
in vec3 v_barycentric;
flat in int v_id;

out vec4 fragColor;

// Hash function by David Hoskins. May 2018
// https://www.shadertoy.com/view/XdGfRR
//---------------------------------------------------------------------------------------------------------------
float hash11(float p) {
	uvec2 n = uint(int(p)) * uvec2(1597334673U, 3812015801U);
	uint q = (n.x ^ n.y) * 1597334673U;
	return float(q) * 2.328306437080797e-10;
}
float hash11(uint q) {
	uvec2 n = q * uvec2(1597334673U, 3812015801U);
	q = (n.x ^ n.y) * 1597334673U;
	return float(q) * 2.328306437080797e-10;
}


const float WIDTH = 0.01;
const float DUTY = 0.5;
const float HIGH = 0.1;

const float A = (1.0 - HIGH) / (1.0 + HIGH);
const float B = 1.0 / WIDTH;
const float C = 0.5 * HIGH;


float particleX(float x) {
    return hash11( floor(B * x) ) * A + C;
}

bool showParticle(float x) {
    return true; // fract(WIDTH * x) < DUTY;
}

bool isParticle(float x, float y) {
    return ( abs(y - particleX(x)) < C ) && showParticle(x);
}


float lightFalloff(float dist) {
    return dist * dist * dist * 16.0;
}

void main() {
    float dist = min(v_barycentric.y, v_barycentric.z) * 0.8 + 0.2;

    float time_offset = fract( hash11( uint(v_id) ) );

    float a = lightFalloff(dist);
    float b = isParticle(v_barycentric.x + fract(-u_time * 0.2) + time_offset, v_barycentric.y) ? 1.0 : 0.6;

    vec3 color = v_id % 2 == 0 ? v_startcolor : v_endcolor;

    fragColor = vec4(color * a * b, 1);
}