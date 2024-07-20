<script lang="ts">
    
    import { browser } from '$app/environment';
    import { base } from "$app/paths";
    import { assertExists, UniqueIDs } from "$lib/uniqueid";
    import { load, MAX_AUDIBLE_FQ } from './synths';

    import i_ptable from '$lib/atomicspectra/elements.json'
    import type { PTable } from '$lib/atomicspectra/types/native';
    import { WebGLUtils } from '$lib/webgl/utils';

    import testFrag     from './test_frag.glsl?raw';

    import fragSource   from './main_frag.glsl?raw';
    import vertexSource from './main_vert.glsl?raw';

    const elements = (i_ptable as PTable).elements;
    
    if( browser ){

        const FFT_WIDTH = 4096;
        const BIN_WIDTH = FFT_WIDTH / 2;
        const fftBuffer = new Float32Array(BIN_WIDTH);

        // ----------- Audio -----------

        const synths   = load(); // SSR cannot witness this or it dies
        const master   = new AudioContext();
        const analyzer = master.createAnalyser();

        const sci_voices = new synths.VoiceManager(master, analyzer);
        const mus_voices = new synths.VoiceManager(master);

        analyzer.fftSize = FFT_WIDTH;
        // analyzer.connect(master.destination); // send analyzer to speakers
        analyzer.maxDecibels = 100;
        analyzer.minDecibels = -20;
        
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
                sci_voices.start(element)
                mus_voices.start(element)
            });
        }

        document.addEventListener('mouseup', (e) => { // if you drag off of something and release, we still want to stop all sounds
            window.clearTimeout(easter_egg_timeout);
            sigma_easter_egg.pause();
            sci_voices.stopAll();
            mus_voices.stopAll();
        });


        // ----------- WebGL -----------

        const canvas = assertExists('gl-canvas') as HTMLCanvasElement;
        const gl = canvas.getContext('webgl2', {preserveDrawingBuffer: true}) as WebGL2RenderingContext;
        if( !gl ) throw new Error('WebGL2 not supported');

        const program = WebGLUtils.createProgram(gl, fragSource, vertexSource);
            canvas.width = FFT_WIDTH;
            canvas.height = 256;

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

        const MAGIC_NUMBER = (2 * MAX_AUDIBLE_FQ / master.sampleRate); // at least I know how to calculate it now, but why?
        function updateFloat32ArrayTexture(tex: WebGLTexture, data: Float32Array){
            gl.bindTexture(gl.TEXTURE_2D, tex);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, data.length * MAGIC_NUMBER, 1, 0, gl.RED, gl.FLOAT, data);
        }

        const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        const positions = [
            -1, -1,
             1, -1,
            -1,  1,
             1,  1,
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(program);

        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

        const fft_tex = createFloat32ArrayTexture(BIN_WIDTH)!;

        const fftUniform        = gl.getUniformLocation(program, 'u_fft');
        const spectraUniform    = gl.getUniformLocation(program, 'u_spectra');
        const fftsizeUniform    = gl.getUniformLocation(program, 'u_fftsize');
        const samplerateUniform = gl.getUniformLocation(program, 'u_samplerate');
        
        gl.uniform1f(fftsizeUniform, FFT_WIDTH);
        gl.uniform1f(samplerateUniform, master.sampleRate);

        gl.uniform1i(fftUniform, 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, fft_tex);

        const img = new Image();
        img.src = `${base}/assets/webdev/spectrasounds/spectra_380_to_780.png`;
        img.onload = () => {

            console.log('loaded')
            gl.uniform1i(spectraUniform, 1);
            const spectra_tex = WebGLUtils.createTexture(gl, img);
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, spectra_tex);

            gl.activeTexture(gl.TEXTURE0); // set back to normal

            function render() {
                analyzer.getFloatFrequencyData(fftBuffer);
                updateFloat32ArrayTexture(fft_tex, fftBuffer);

                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
                requestAnimationFrame(render);
            }
            render();
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
                            <div>Every element emits a unique signature of electromagnetic waves when excited.</div>
                            <div>We perceive a subset of these as light, ranging from 780nm to 380nm on average.</div>
                            <br>
                            <div>Similarly, various things in life produce pressure waves when in action.</div>
                            <div>We perceive a subset of these as sound, ranging from 20hz to 20khz on average.</div>
                            <br>
                            <div><i>But what if we swapped one for the other?</i></div>
                            <div>Click an element to hear what it would sound like!</div>
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
                    <div class="footer">
                        <div>
                            <div>While hearing the true visible spectrum is impossible since it's MANY orders of magnitude</div>
                            <div>too high-pitched, we CAN still map it onto the audible spectrum.</div>
                            <br>
                            <div>Here, I have mapped sounds logarithmically to visible frequencies.</div>
                            <div>That way, you'll have a better idea of how it might have sounded if we evolved this way.</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </section>
</div>
