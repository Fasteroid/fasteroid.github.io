<script lang="ts">
    import { base } from "$app/paths";
    import ExpressionBox from "../../../components/expressionbox/ExpressionBox.svelte";
    import BackgroundTitle from "../../../components/titlebar/BackgroundTitle.svelte";
</script>

<div class="margins">
    <section>
        <BackgroundTitle title="Gmod Plate Cutting Tool" background='{base}/assets/expression2/platecutter/banner.jpg'/>
        <section class="extra-space" style="min-height: 306pt">
            <img src="{base}/assets/expression2/platecutter/usage.jpg" style="float:left; max-height: 306pt; margin-left: 0px;" alt="A player preparing to split a 1x2 plate into two 1x1 plates">
            For those unfamiliar, hunter plates are a subset of the default construction props in Garry's Mod.  They are my
            favorite props to build with, and are objectively the most popular within the Garry's Mod community.<br>
            <br>
            There's just one problem.  The tiles that make up these plates are impossible to split apart by normal means.  
            This meant that in the past, whenever I wanted to trim off excess, cut out shapes, or split faces, I had to 
            manually reconstruct new and often complicated arrangements of plates.  Doing this was both time intensive
            and wasteful in terms of entity count.<br>
            <br>
            So guess what?  About a year after concieving the idea, I'm proud to present my hunter plate cutter to the world—the hottest new
            thing since Precision Alignment!  Now you can rip hunter plates along their seams like plywood boards on a table saw!<br>
            <br>
            This E2 aims to solve all three of the aforementioned problems in a single group of shared utilities.  These 
            utilities are all powered by one piece of code—a recursive plate building function.  It can take orders
            for any size hunter plate (even those that don't exist) and spawn it at any location and angle—all without
            requiring prop resizing or custom models! This function not only allows you to summon whatever size 
            plates your build calls for, but also lets you cut them in half and punch out holes of custom dimensions.<br>
            <br>
            Make sure to first grab the <a href="https://github.com/Fasteroid/expression2-public/tree/master/plate_cutter_util">dependencies</a>
            from my Github if you want to try this out.  Cheers!<br>
        </section>
        <ExpressionBox source="https://raw.githubusercontent.com/Fasteroid/expression2-public/master/plate_cutter_util/gmod_plate_cutter.txt"></ExpressionBox>
    </section>
</div>
