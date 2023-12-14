<script lang="ts">
    import { base } from "$app/paths";
    import ExpressionBox from "../../../components/expressionbox/ExpressionBox.svelte";
    import BackgroundTitle from "../../../components/titlebar/BackgroundTitle.svelte";
</script>

<style lang="scss">
    @import "./hampter.scss";
</style>

<div class="margins">
    <section>
        <BackgroundTitle title="{`Hammond's "Wrecking Ball" from Overwatch`}" background='{base}/assets/expression2/hampter/banner.jpg'/>
        <div class="dualcontent">
            <iframe 
                src="https://www.youtube-nocookie.com/embed/FjhJLVtnZmw" 
                title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope">
            </iframe>
            <section style="min-height: 306pt">
                Backstory time!<br>
                <br>
                In spring of 2017, as a result of finding and loving Freejam's <i>Robocraft</i> so much, all my attention for Overwatch 1 had evaporated.  
                As a result, I ended up missing virtually every new hero after Orisa's release in winter of 2017.  
                Word of new heroes still reached me occasionally, but these were whispers in the wind by the time they reached me—nothing 
                that would motivate me enough to reinstall Overwatch instead of picking literally any other "perfect" sandbox game in my library.<br>
                <br>
                That is the story of how I missed my opportunity to main <i>Wrecking Ball</i>, aka. "Hammond" in Overwatch 1.<br>
                To date, and with zero exaggeration, this is one of the worst mistakes I've made in my entire life.<br>
                <br>
                After all the noise caused by the announcement of Overwatch 2, and a close friend begging me to play it with her, I
                finally reinstalled the game.  It was here where I finally tried out Wrecking Ball for the first time—something I should have
                done upon his release almost 4 years prior—and instantly recognized the main that would have kept me playing Overwatch 1.<br>
                <br>
                This Expression&nbsp;2 project is a tribute to my favorite hero of the Overwatch universe and the hardworking Blizzard employees
                who dreamed him up.  Full feature parity with Overwatch was achieved from scratch in just two weeks (grappling hook, piledriver, quad cannons, legs) in part
                thanks to heavy use of my <a href="./vr-holo-designer">VR Hologram Designer</a>, but officially releasing this took much
                longer due to taking a detour to rewrite this portfolio site.<br>
                <br>
                Alas, now that those rewrites are complete, E2 Wrecking Ball is finally done and ready for the world to see!<br>
                <br>
                If you want to try out Wrecking Ball yourself, it can be installed by merging the contents of this
                <a href="https://github.com/Fasteroid/expression2-public/blob/master/wrecking_ball/EZ-INSTALL.zip">EZ-INSTALL.zip</a>
                with your expression2 folder.<br>
                <br>
                I hope you enjoy it!  I had a lot of fun making this one.
            </section>
        </div>
        <ExpressionBox 
            source="https://raw.githubusercontent.com/Fasteroid/expression2-public/master/wrecking_ball/wrecking_ball_main.txt"
            name="awesome-hampter"
        />
    </section>
</div>
