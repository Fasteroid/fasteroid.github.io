#version 300 es

precision highp float;

uniform sampler2D u_fft;
uniform sampler2D u_spectra;
uniform float     u_samplerate;
uniform float     u_fftsize;

const float AUD_MAX_FQ = 20000.0;
const float AUD_MIN_FQ = 20.0;

in vec2 v_texCoord;
out vec4 outColor;

const float BLOOM_WIDTH = 1.0 / 128.0;
const float BLOOM_STEP  = 64.0;

float dbToAmp(float db) {
    return pow(10.0, (db + 100.0) / 20.0);
}

void main()
{
    vec2 uv = v_texCoord;

    float amp = 0.0;
    float total = 0.0;

    for (float x = -1.0; x < 1.0; x+=1.0/BLOOM_STEP) {
        float weight = exp(-x*x*BLOOM_STEP);
        amp   += ( texture(u_fft, vec2( uv.x + x * BLOOM_WIDTH, 0 )).r + 150.0 ) * weight;
        total += weight;
    }
    amp /= total;
    amp = amp * 0.1;
    amp = dbToAmp( amp - 50.0 );
    // amp = log2(amp);
    // amp = dbToAmp(amp);

    vec3 color2 = texture( u_spectra, vec2(uv.x, 1.0 + uv.y - amp * 0.001) ).xyz;

	outColor = vec4(color2,1.0);
}
