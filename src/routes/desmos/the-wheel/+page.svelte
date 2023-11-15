<script lang="ts">
  import { base } from "$app/paths";
</script>

<div class="margins">
    <section>
        <hgroup>
            <h2>Desmos 3D: THE WHEEL</h2>
            <h3>YOUR PATHETIC SCHOOL-TAUGHT ALGEBRA HAS NO POWER HERE!</h3>
        </hgroup>
        <section class="extra-space">
            <iframe src="https://www.desmos.com/3d/1682b5dc3a" style="width: 100%; height: 50vh" frameborder=0 title="graph"></iframe>
        </section>
        <section class="extra-space">
            <img 
                style="float:right; height: 30%"
                src="{base}/assets/desmos/wheelirl.jpeg"
                alt="wtf"
            />
            This stupidity has been living rent-free in my head since I first sketched it in my Calculus 1 notebook over 5 years ago.<br>
            Since Desmos 3D exists now, this horrible thing can finally be put to rest so I don't have to think about it anymore.<br>
            <br>
            The idea is simple: graph any function with vertical asymptote(s), add curvature along the y axis, 
            tape the ends of the asymptote(s) together, and <i>voilà</i>, you have now broken normal algebra, for &minus;infinity and &plus;infinity are now the same number.<br>
            <br>
            This recently popped back into my head after seeing a meme (one I couldn't find again to save my life) regarding "the wheel", and how remarkably similar it looked to my original
            drawing.  What is "the wheel", you ask?  Well apparently, it's <a href="https://en.wikipedia.org/wiki/Wheel_theory">a completely different set of algebraic rules</a>,
            designed exactly around this goofy graph on a toilet-paper roll concept.  I had no idea this stupid idea had any real practicality in mathematics, but apparently,
            <i>it does.  </i>I mean, it has a Wikipedia page.<br>
            <br>
            <div style="clear: both;"></div>
            Why was I thinking about this in Calculus 1?  If you squint at it, the behavior of the line wrapping around from negative infinity to infinity or vise-versa looks <i>remarkably similar</i>
            to how big numbers in computers wrap around due to integer overflow/underflow.  For a while I thought logic itself might be prone to overflow errors, until I realized that taping
            the ends of the asymptote together is an entirely arbitrary decision.<br>
            <br>
            What is scary though is that if you squint at general relativity and quantum mechanics, and think about how they describe behaviors different than the norm for values that are either really 
            big or really small, many parallels to floating-point arithmetic and its behavior around the biggest of big and smallest of small might start coming to mind 😳
            <br>
        </section>
    </section>
</div>
