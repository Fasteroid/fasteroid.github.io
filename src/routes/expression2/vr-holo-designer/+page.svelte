<script lang="ts">
    import { base } from "$app/paths";
    import ExpressionBox from "../../../components/expressionbox/ExpressionBox.svelte";
    import BackgroundTitle from "../../../components/titlebar/BackgroundTitle.svelte";
</script>

<div class="margins">
    <section>
        <BackgroundTitle title="VR Hologram Structure Designer" background='{base}/assets/expression2/vrholodesigner/banner.jpg'/>
        <section class="extra-space" style="min-height: 306pt">
            <iframe 
                style="float:left; max-width: 50%; width: 540px; height: 360px; margin: 0px 15px 15px 0px"
                src="https://www.youtube-nocookie.com/embed/xBw6j0v6cZ0" 
                title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope">
            </iframe>
            When it comes to creating custom 3D visuals for one's Expression 2 creations, holograms are really the only way to do it.  
            However, even since their addition to E2 over 10 years ago, the process of modeling without tools still hasn't gotten
            any easier.<br>
            <br>
            It starts with envisioning something cool, like a car, cat, or boat with a tophat.  
            Next, break that cool thing into primitive shapes, like spheres, domes, cubes, cylinders, pyramids, etc.  
            Finally, hardcode the coordinates, angles, scales, etc. of those shapes into the E2.<br>
            <br>
            <i>Surely nothing can go wrong on the last step, right?</i><br>
            <br>
            Not even the legendary Markus Persson, otherwise known as <i>Notch, the creator of Minecraft</i>, could do this reliably for his models.  
            The most iconic monster in the game, the creeper, originated from a failed pig model, where the height and 
            length of the torso were mistakenly swapped.  Had this little mistake not happened, we would never have gotten
            the monster we know today for blowing up hopes and dreams.<br>
            <br>
            <div style="clear: both;"></div>
            I envisioned a better way.  What if instead of having to deal with the hassle of hardcoding magic numbers, you could just
            intuitively model things in 3D space?  What if better yet, there was a library that could also automate summoning 
            these structures for you as necessary?<br>
            <br>
            I now introduce: A VR hologram "CAD" program for Garry's Mod, that works <i>in conjunction</i>
            with an easy-to-use library that lets you spawn your hologram structures in a <i>single line of code</i>.  Annoying "gotchas"
            like hologram ids, hologram spawning rate-limit, and moving groups of holograms around are now all handled for you.  
            Developing ridiculously awesome hologram creations has never been easier!<br>
            <br>
            With the help of <a href="https://steamcommunity.com/workshop/filedetails/?id=1678408548">VRMod</a>, you can use this tool
            with any VR headset that's supported by SteamVR.<br>
            <br>Now get out there and design your dreams!
        </section>
        <ExpressionBox 
            source="https://raw.githubusercontent.com/Fasteroid/expression2-public/master/vr_holo_designer/vr_holo_designer.txt"
            name="vr-holo-designer"
        />
    </section>
</div>
