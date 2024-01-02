<script lang="ts">
    import { base } from "$app/paths";
    const nature_pics = [
        ["basalt", "Basalt columns at Giant's Causeway"],
        ["bubbles", "The inside of your 5-year-old's glass of milk"],
        ["giraffe", "Spots on a giraffe"],
        ["plant", "Some plant cells"]   
    ]
    const hollow_pics = [
        ["hollow-2d","https://www.desmos.com/calculator/5wz9m21dsz"],
        ["hollow-3d","https://www.desmos.com/3d/84efbae3f9"]
    ]
    const solid_pics = [
        ["solid-2d","https://www.desmos.com/calculator/x8upv3ggmi"],
        ["solid-3d","https://www.desmos.com/3d/35ffa11fb2"]
    ]
</script>

<style lang="scss">
    @import "./voronoi-cobble.scss";
</style>

<div class="margins">
    <section>
        <hgroup>
            <h2>Desmos 3D: Voronoi Cobblestone</h2>
            <h3>And some other cool facts about this kind of pattern!</h3>
        </hgroup>
        <section class="extra-space">
            <iframe src="https://www.desmos.com/3d/d449cfa4bc" style="width: 100%; height: 50vh" frameborder=0 title="graph"></iframe>
        </section>
        <section class="extra-space">
            <i>What is a Voronoi?</i>, you might be asking—well let me answer.<br>
            <br>
            Imagine scattering some colored marbles onto a large sheet of paper.  After that, color each point on the paper the same color as the nearest marble.  
            Once your paper is completely colored, you will have a Voronoi diagram.<br>
            <br>
            Many related structures exist in nature, and typically emerge wherever "cell-like" activity is present:
            <div class="quadruple collapsing shelf">
                {#each nature_pics as data}
                    <img
                        src="{base}/assets/desmos/voronoi/{data[0]}.png"
                        alt="{data[1]}"
                        title="{data[1]}"
                    />
                {/each}
            </div>
            The "cobblestone" in this graph is one such related structure.  Notice how each region contains exactly one point—no more, no less.
            But why did I make the boundaries blobby instead of perfectly straight like the ideal Voronoi diagram?<br>
            <br>
            Perfectly straight boundaries actually posed two different problems, depending on how I implemented them:<br>
            <div class="double collapsing shelf">
                <div class="stack">
                    <div>
                        The first thing I tried was asking the calculator to show surfaces where across the distances between the current pixel and each marble, 
                        the minimum of that was equal to the distance between the current pixel and current marble:<br>
                        <br>
                        As you can see, in 3D, the boundaries end up a mess for some reason.  It probably has something to do with how Desmos 3D infers
                        surface normals, but I'm not really qualified to speculate on that since I don't know how it works.
                    </div>
                    <div class="double shelf">
                        {#each hollow_pics as data}
                            <a href="{data[1]}">
                                <img
                                    src="{base}/assets/desmos/voronoi/{data[0]}.png"
                                    alt="{data[0]}"
                                />
                            </a>
                        {/each}
                    </div>
                </div>
                <div class="stack">
                    <div>
                        The second method was basically the same as the first, except I asked the calculator to fill entire regions instead of
                        just locating surfaces:<br>
                        <br>
                        While this did clear up the distorted surfaces, it created an entirely different problem: in 3D, it's solid and you can't see inside it.
                        And since we aren't four-dimensional, there's literally no hope of ever perceiving the entire cube and its insides at once.  So this approach doesn't work either.
                    </div>
                    <div class="double shelf">
                        {#each solid_pics as data}
                            <a href="{data[1]}">
                                <img
                                    src="{base}/assets/desmos/voronoi/{data[0]}.png"
                                    alt="{data[0]}"
                                />
                            </a>
                        {/each}
                    </div>
                </div>
            </div>
            In the end, I ultimately settled with my weird version instead, since the blobby boundaries give it character.<br>
            The examples shown in nature aren't perfect either!
        </section>
</div>
