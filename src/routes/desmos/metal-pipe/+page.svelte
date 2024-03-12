<script lang="ts">
    import { browser } from '$app/environment';
    import { base } from "$app/paths";
    if( browser ){
        setTimeout(() => {
            let clickbait = document.getElementById("clickbait_arrow")!;
            clickbait.hidden = false;
        }, 2000)
    }
</script>

<style lang="scss">
    @import "./metal-pipe.scss";
</style>

<div class="margins">
    <section>
        <hgroup>
            <h2>Desmos 3D: Falling Metal Pipe WITH SOUND</h2>
            <h3>*CLANGALANGGLALANGANGANG*</h3>
        </hgroup>
        <section class="extra-space">
            <div class="clickbait" id="clickbait_arrow" hidden>
                <img src="{base}/assets/desmos/pipe/stupid-arrow.svg" alt="">
                <div>Click this</div>
            </div>
            <iframe src="https://www.desmos.com/3d/79558b3def" style="width: 100%; height: 50vh" frameborder=0 title="graph"></iframe>
        </section>
        <section class="extra-space">

            <div>
                <div class="audio">
                    <div>Click to play</div>
                    <audio controls src="{base}/assets/desmos/pipe/jixaw-metal-pipe-falling-sound.mp3"></audio>
                    <div>WARNING: Loud</div>
                </div>
                According to <a href="https://knowyourmeme.com/memes/metal-pipe-falling-sound-effect">Know Your Meme</a>,
                The Metal Pipe Falling Sound Effect, also known as 
                <i>Destruction&#8203;_&#8203;Metal&#8203;_&#8203;Pole&#8203;_&#8203;L&#8203;_&#8203;Wave&#8203;_&#8203;2_0_0.wav</i>, 
                refers to the sound of a long metal pipe falling and hitting the ground. On YouTube and TikTok, 
                among other video meme platforms like iFunny, the metal pipe falling sound has been used as a random 
                punchline to various ironic memes.
            </div>
            <br>
            But why, and more importantly <i>HOW</i> have I reproduced it in Desmos?<br>
            <br>
            Recently, Desmos added a new function called <code>tone()</code>.  It plays sine waves of specific
            amplitude and frequency depending on the parameters you pass.  So I got to 
            thinking—<i>what if I found the frequencies and amplitudes of a really goofy sound and played those back through <code>tone()</code>?</i>  
            As it turns out, exactly what you might have expected happens—you get the original sound back...more or less!<br>
            <br>
            <i>How did I find the frequencies and amplitudes though</i>, you ask...well, I used a fascinating piece of math called the Fourier Transform! 
            It was invented by Joseph Fourier in the 1800's and designed exactly for this purpose.  Like an auditory prism, it can be used to split
            a complicated waveform into its constituent frequencies.<br>
            <br>
            What you hear when you unmute this graph (click the speaker icon in the top left) is the result of running the Fast Fourier Transform on 
            4096-sample chunks of the metal pipe sound effect every 33ms, then playing back the 32 most prominent frequencies from each chunk at their
            respective amplitudes.  I could have done more than this, but 32 tones at once is actually rather stressful for lower-end machines.<br>
            <br>
            If you want to learn more, also check out <a href="https://www.youtube.com/watch?v=spUNpyF58BY">this video by 3Blue1Brown</a> that covers the Fourier Transform
            in depth.
        </section>
</div>
