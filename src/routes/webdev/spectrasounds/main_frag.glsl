#version 300 es

precision highp float;

uniform sampler2D u_fft;
uniform sampler2D u_spectra;
uniform float     u_samplerate;
uniform float     u_fftsize;


in vec2 v_texCoord;
out vec4 outColor;

float translateFFT(float fft) {
    return 1.0 - ( fft + 140.0 ) * 0.01;
}

void main()
{
    vec2 uv = v_texCoord;

    // I'm not sure where these numbers come from, but they seem to make the spectra match better.
    // I know for a fact I'm interpolating the FFT data wrong, but I don't know what the right way is.
    float idx = uv.x * 0.9 - 0.1;

    float amp = 0.0;
    float total = 0.0;
    for (float x = -1.0; x < 1.0; x+=1.0/64.0) {
        float weight = exp(-x*x*64.0);
        amp   += translateFFT( texture(u_fft, vec2( idx + x / 256.0, 0 ) ).r ) * weight;
        total += weight;
    }
    amp /= total;

    vec3 color2 = texture( u_spectra, vec2(uv.x, uv.y + amp * 0.5) ).xyz;
    
	outColor = vec4(color2,1.0);
}
