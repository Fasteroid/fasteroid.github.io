<script lang="ts">
    
    import { browser } from '$app/environment';
    import { base } from "$app/paths";
    
    if( browser ){

        const quads = document.getElementById('quadrants') as HTMLElement;
        console.log(quads)

    }

</script>

<style lang="scss">
    @use "vars/globals.scss" as globals;
    @use 'sass:math' as math;

    .container {
        display: flex;
        flex-flow: wrap;
        gap: 30px;
        width: 100%;
    }

    img {
        padding: 0;
        margin: 0;
        background-color: none;
    }

    .example {
        background-color: globals.$section-background;
        padding: 15px;
        gap: 7px;
        font-size: 80%;
        align-items: center;
        text-align: center;
        display: flex;
        flex-direction: column;

        > :nth-child(2) {
            width: 0;
            min-width: 100%;

            > div {
                margin-bottom: 10px;
            }

            > :last-child {
                margin-bottom: 0;
            }
        }
    }

    .css-filters img {
        transform: rotate(180deg);
        filter: invert(1);

        transition: 
            transform 0.3s ease,
            filter 0.3s ease
        ;

        &:hover {
            transform: none;
            filter: none;
        }
    }

    .quandrants {
        > :first-child {
            display: grid;
            grid-template-areas: 'a';
            

            > * {
                z-index: 1;
                grid-area: a;

                &:hover {
                    clip-path: xywh(0% 0% 100% 100%) !important;
                    z-index: 0;
                }
            }
            
            &:hover > :not(:hover) {
                opacity: 0;
            }

            @for $n from 0 through 3 {
                > :nth-child(#{$n + 1}):not(:hover) {

                    $x: ($n % 2) * 50;
                    $y: math.floor( $n * 0.5 ) * 50;
                    clip-path: xywh(
                        #{$x+'%'}
                        #{$y+'%'}
                        50.5%
                        50.5%
                    );
                }
            }
        }
    }
</style>

<div class="margins">
    <section>
        <hgroup>
            <h2>Web Experiments: Anti-AI Image Mangling</h2>
            <h3>Confuse clankers, stop art theft</h3>
        </hgroup>
        <div class="p">
            These days, if you post something to the internet, the chances that it'll be scraped by some corporation for AI training are high.<br>
            I don't like that very much.<br>
            <br>
            Not only is it blatant theft of intellectual property, but it's also a fruitless endeavour. Generative AI will never invoke the sonder that real art does,
            because it has no life story—no unique set of circumstances that lead to the pieces it creates.  I want corporations to stop wasting humanity's finite resources
            on this.<br>
            <br>
            While there are technologies like 
            <a href="https://glaze.cs.uchicago.edu" target="_blank">Glaze</a> and <a href="https://nightshade.cs.uchicago.edu" target="_blank">Nightshade</a>
            which attempt to poison images and attack the model training phase, they do nothing to stop those images from being scraped.  That's not to mention
            the other issues with using adversarial perturbation, such as the fragility, architecture-specificness, and lack of suitability for certain images
            it presents.  A better approach would just be to make your art a pain-in-the-ass to scrape all together.  Due to the volume of data they must collect,
            AI scrapers really don't have the time to look under rocks for spare keys.<br>
            <br>
            So the idea is pretty simple: "lock" the image, then "hide the spare key" in a way that's obvious to a human, but not a bot trying to scrape the images.<br>
            <br>
            Here are some ideas I had for that avenue.  All the images below are presented "weird" ways that would require a targeted spec-ops attack on my site or the
            associated <a href="https://github.com/Fasteroid/fasteroid.github.io" target="_blank">github repository</a> to scrape correctly for training data.<br>
            <br>
            Hover your cursor on them to see what I mean.
        </div>
        <div class="container">
            <div class="css-filters example">
                <img src="{base}/assets/miscellaneous/imagemangling/css-filters.png" alt="Yellow cubes with pink borders in the goo plant on gm_bigcity">
                <div>
                    <div>An inverted image, which appears normal due to some CSS filters.</div>
                    <div>A scraper would need to know to invert underlying image.</div>
                </div>
            </div>

            <div class="quandrants example">
                <div id="quadrants">
                    {#each [1,2,3,4] as idx}
                        <img src="{base}/assets/miscellaneous/imagemangling/quadrants/{idx}.png" alt="">
                    {/each}
                </div>
                <div>
                    <div>Four separate images, each of which are ~75% trollface and ~25% actual image.</div>
                </div>
            </div>
        </div> 

    </section>
</div>
