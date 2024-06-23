#version 300 es

precision highp float;

uniform sampler2D u_fft;
uniform sampler2D u_spectra;

in vec2 v_texCoord;
out vec4 outColor;

const float WL_LONGEST  = 780.0;
const float WL_SHORTEST = 390.0;
const float WL_RANGE    = WL_LONGEST - WL_SHORTEST;

const float FQ_MAX = 1.0 / WL_SHORTEST;
const float FQ_MIN = 1.0 / WL_LONGEST;
const float FQ_RANGE = FQ_MAX - FQ_MIN;

float translateFFT(float fft) {
    return 1.0 - ( fft + 200.0 ) * 0.01;
}



void main()
{
    vec2 uv = v_texCoord;


    float amp = 0.0;
    float total = 0.0;
    for (float x = -1.0; x < 1.0; x+=1.0/64.0) {
        float weight = exp(-x*x*64.0);
        amp += translateFFT( texture(u_fft, uv + vec2(x / 512.0,0)).r ) * weight;
        total += weight;
    }
    amp /= total;

    vec3 color2 = texture( u_spectra, vec2(uv.x, uv.y + amp) ).xyz;
	outColor = vec4(color2,1.0);
}
