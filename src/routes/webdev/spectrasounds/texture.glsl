
precision highp float;

uniform vec2      u_resolution;

uniform sampler2D u_spectra;
uniform sampler2D u_fft;

// 0  10
// 01 11

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;

    uv.y = 1.0 - uv.y;

    float amp = texture2D(u_fft, uv).r; // 1 = max brightness, 0 = min

    // amp = 0.5
    // top is always max dark
    // bottom is amp brightness

    vec2 spectra_sample = vec2( 
        uv.x,
        uv.y - 1.0 + amp
    );
    
    gl_FragColor = texture2D(u_spectra, spectra_sample);
}