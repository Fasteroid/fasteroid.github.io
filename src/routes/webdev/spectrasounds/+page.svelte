<script lang="ts">
    
    import { browser } from '$app/environment';
    import { base } from "$app/paths";
    import { assertExists, UniqueIDs } from "$lib/uniqueid";
    import { load } from './synths';

    import i_ptable from '$lib/atomicspectra/elements.json'
    import type { PTable } from '$lib/atomicspectra/types/native';
    import { WebGLUtils } from '$lib/webgl/utils';

    import fragSource from './texture.glsl?raw';

    const elements = (i_ptable as PTable).elements;

    if( browser ){

        // Audio
        {
            const synths = load(); // SSR cannot witness this or it dies
            const master = new AudioContext();
            const voices = new synths.VoiceManager(master);
            
            const sigma_easter_egg   = new Audio(`${base}/assets/webdev/spectrasounds/what_is_that_melody.mp3`);
            let   easter_egg_timeout = 0;
            let   easter_egg_played  = false;

            function playEasterEgg(){
                if( easter_egg_played ) return;
                easter_egg_played = true;
                sigma_easter_egg.play();
            }

            for( const element of elements ){
                if( !element.spectra ) continue; // skip elements without spectra, eg. rutherfordium
                const html: HTMLElement = assertExists(element.name);

                html.addEventListener('mousedown', () => {
                    easter_egg_timeout = window.setTimeout( playEasterEgg, 1000 );
                    voices.start(element)
                });
            }

            document.addEventListener('mouseup', (e) => { // if you drag off of something and release, we still want to stop all sounds
                window.clearTimeout(easter_egg_timeout);
                sigma_easter_egg.pause();
                voices.stopAll();
            });
        }

        // Visual
        {

            function createFloat32ArrayTexture(len: number){
                const tex = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, tex);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, len, 1, 0, gl.RED, gl.FLOAT, null);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                return tex;
            }

            function updateFloat32ArrayTexture(tex: WebGLTexture, data: Float32Array){
                gl.bindTexture(gl.TEXTURE_2D, tex);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, data.length, 1, 0, gl.RED, gl.FLOAT, data);
            }

            const canvas = assertExists('gl-canvas') as HTMLCanvasElement;

            const gl = canvas.getContext('webgl2') as WebGL2RenderingContext;
            if( !gl ) throw new Error('WebGL2 not supported');

            const program = WebGLUtils.createProgram(gl, fragSource);

            WebGLUtils.setup2DFragmentShader(gl, program, canvas);

            const image = new Image();
            image.src = `${base}/assets/webdev/spectrasounds/spectrum.png`;
            image.onload = () => {

                const spectra_tex = WebGLUtils.createTexture(gl, image)!;
                const fft_tex     = createFloat32ArrayTexture(1024)!;

                const spectra_tex_location = gl.getUniformLocation(program, 'u_spectra');
                const fft_tex_location     = gl.getUniformLocation(program, 'u_fft');

                gl.uniform1i(spectra_tex_location, 0);
                gl.uniform1i(fft_tex_location, 1);
                
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, spectra_tex);

                gl.activeTexture(gl.TEXTURE1);
                gl.bindTexture(gl.TEXTURE_2D, fft_tex);

                setInterval(() => {
                    // random 1 x 1024 texture
                    const test_data = new Float32Array(1024);
                    for( let i = 0; i < 1024; i++ ){
                        test_data[i] = Math.random();
                    }
                    updateFloat32ArrayTexture(fft_tex, test_data);
                }, 100);
                
                function render() {
                    gl.clear(gl.COLOR_BUFFER_BIT);
                    gl.drawArrays(gl.TRIANGLES, 0, 6);
                    requestAnimationFrame(render);
                }
                render();
                
            }



        }

    }

</script>

<style lang="scss">
    @import "./ptable.scss";
</style>

<div class="margins">
    <section>
        <hgroup>
            <h2>Atomic Spectra Keyboard</h2>
            <h3>WHAT IS THAT MELODY???</h3>
        </hgroup>
        <section class="extra-space">
            <div class="grid-stack">
                <canvas id='gl-canvas'/>
                <div>
                    <div class="title">
                        <div>
                            <div>Every element produces a set of unique electromagnetic frequencies when excited.</div>
                            <div>Of these sets, we perceive the visible spectrum—wavelengths between 750nm and 380nm</div>
                            <br>
                            <div><i>But what if we could hear these frequencies?</i></div>
                            <div><i>Click on an element to find out.</i></div>
                        </div>
                    </div>
                    <div class="wrapper">
                        <div class="ptable">
                            {#each elements as element}
                                <div class="{element.spectra ? 'playable' : ''} {element.category} element" style="grid-column: {element.table_x}; grid-row: {element.table_y}" id={element.name}>
                                    <div class="number">{element.atomic_number}</div>
                                    <div class="symbol">{element.symbol}</div>
                                    <div class="name">
                                        <div>{element.name}</div>
                                        <div>{element.atomic_mass.toFixed(3)}</div>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </section>
</div>
