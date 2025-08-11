<script lang="ts">
    import { base } from "$app/paths";
    import ExpressionBox from "../../../components/expressionbox/ExpressionBox.svelte";
    import BackgroundTitle from "../../../components/titlebar/BackgroundTitle.svelte";
</script>

<div class="margins">
    <section>
        <BackgroundTitle background='{base}/assets/expression2/platecutter/banner.jpg'>
            Plastic Plate Fabricator
        </BackgroundTitle>
        <section class="extra-space" style="min-height: 306pt; margin: 15px;">
            <img src="{base}/assets/expression2/platecutter/usage.jpg" style="float:left; max-height: 306pt; margin-left: 0px;" alt="A player preparing to split a 1x2 plate into two 1x1 plates">
            Garry's Mod is a sandbox game.  For many, this means building things is a core principle.  To assist with this,
            around 2008, in Gmod 13, many new Gmod-exclusive props were added to the base game.  This included a large set of
            tiled cubes and plates which could be used to quickly and precisely construct houses, vehicles, etc.<br>
            <br>
            There's just one problem.  You can't really cut them to size.  Sure, there's a pretty large selection of them,
            but if you wanted something really weird like a 27x43 plate, your only option was building it out of smaller plates.  Gmod doesn't natively have that size.  
            This was both time intensive and usually wasteful in terms of prop count.<br>
            <br>
            One day, I had the idea to build an evil lair within the walls of the massive elevator shaft on <i>gm_genesis</i>.
            It was going to be a tight fit though—I needed to get as close to the walls as possible to maximize the available square footage
            inside the base.  The unfortunate thing is that these walls were made of a kind of source engine geometry called a displacement,
            which are used for creating organic sloped surfaces.  This was not something I could adequately conform to with the
            standard construction plate sizes—I needed a way to cut and manipulate them willy-nilly on-site.<br>
            <br>
            So here it is!  In fact, it's more than that—being able to cut things in half first requires a way to summon
            construction plates of any size.  So it can do that too.  And the other side of the saw is a variable-size hole-punch,
            because yeah I needed that too to build my dreams.<br>
            <br>
            Make sure to first grab the <a href="https://github.com/Fasteroid/expression2-public/tree/master/plate_cutter_util">dependencies</a>
            from my Github if you want to try this out.  Cheers!<br>
        </section>
        <ExpressionBox 
            source="https://raw.githubusercontent.com/Fasteroid/expression2-public/master/plate_cutter_util/gmod_plate_cutter.txt"
            name="plate-cutter"
        />
    </section>
</div>
