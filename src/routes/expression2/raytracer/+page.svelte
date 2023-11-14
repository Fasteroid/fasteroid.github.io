<script lang="ts">
    
    import { base } from "$app/paths";
    import ImageCarousel from "../../../components/imagecarousel/ImageCarousel.svelte";
    import BackgroundTitle from "../../../components/titlebar/BackgroundTitle.svelte";

    import renders from "$lib/json/renders.json"
    import type { CarouselImageData, CarouselImagePicker } from "../../../components/imagecarousel/carousel-common";

    // don't remove this or Unique IDs won't synchronize during the build stage:
    import { UniqueIDs } from "$lib/uniqueid";
    UniqueIDs.start()

    function getPicker(modulus: number, offset: number): CarouselImagePicker {
        return function pick(pics: CarouselImageData[]): CarouselImageData[] {
            let n:      number          = 0
            let picked: CarouselImageData[] = []
            for (const pic of pics) {
                if(n == offset) picked.push(pic);
                n = (n + 1) % modulus;
            }
            return picked;
        }
    }

    const intervals = {
        [256]: 4000
    };

</script>

<div class="margins">
    <section>
        <BackgroundTitle title="Expression 2 Raytracer" background='{base}/assets/expression2/raytracer/banner.jpg'/>
        <section class="extra-space">
            &emsp;&emsp;I'll cut the philosophy and cut to the <i>trace</i>—this thing was an absolutely terrible idea 
            in retrospect.  Who would be such an idiot as to write a raytracer that runs serverside, in an interpreted language
            built upon another interpreted language?  Yup.  That would be me.<br>
            <br>
            While I may not work on this anymore because the codebase is a mess and rendering now is just way too slow, I still showcase
            it here because of the incredible journey it took me on.  From the very beginning, where simultaneous reflection and transparency
            forced me to truly tackle recursion for the first time, to the very end, where I learned nearly every render I'd done used only naive
            guesses as to how light really behaves in real life.  Without these renders, I would never have created this portfolio to show them
            and other my amazing projects to the world.<br>
            <br>Godsend, E2 Raytracer.  You will never be forgotten.<br>
            <br>
            Special thanks to <a href="https://discord.com/users/331192747933302837">@Speedeo</a> (bitmaps), and
            <a href="https://discord.com/users/363590853140152321">@Vurv</a> (pnglib) for helping me encode my traces into mostly-to-spec image formats.<br>
            The gallery below would be empty if not for their help!<br>
            <br>
            (Click the left or right sides of the image carousels to browse them.)
        </section>
        <section class="extra-space">
            {#each [0,1,2,3] as offset}
                <ImageCarousel
                    source = { renders[256] }
                    filter = { getPicker(4, offset) }
                    size   = { 256 }
                    autoscroll = {{
                        interval:   intervals[256],
                        delay:      intervals[256] * offset / 4,
                        transition: 250
                    }}
                />
            {/each}
        </section>
    </section>
</div>
