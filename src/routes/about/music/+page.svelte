<script lang="ts">
    import { base } from "$app/paths";
  import { FAVORITES_SIZE_MUL, LIKES_SIZE_MUL, RELICS_SIZE_MUL } from "../../../components/soundcloudgraph/classes";
    import SoundcloudGraph from "../../../components/soundcloudgraph/SoundcloudGraph.svelte";
</script>

<style lang="scss">
    ul.quotes li::marker {
        content: '– '
    }

    .minibr {
        padding: 5px;
    }

    .p2 {
        padding: 15px;
    }

    .first-ul {
        padding-top: 10px;
        margin-block-start: 0;
        padding-inline-start: 20px;
        & > li:not(:last-child) {
            padding-bottom: 10px;
        }
    }
</style>

<body>
    <div class="margins">
        <section>
            <hgroup>
                <h1>Soundcloud Map [BETA]</h1>
            </hgroup>
            <div class="p">
                I get asked all the time about my music preferences.
                <div class="minibr"></div>
                <ul class="quotes">
                    <li><i>"What's your favorite band?"</i></li>
                    <li><i>"Who's your favorite artist?"</i></li>
                    <li><i>"What's your favorite genre?"</i></li>
                </ul>
                <div class="minibr"></div>
                And I'm embarassed every single goddamn time people ask, because I don't have common or straightforward answers to ANY of these.<br/>
                Even if I named a favorite artist, you wouldn't know them.  Nor would you know my favorite genres if I tried to describe them.<br/>
                <br/>
                Instead, here's an interactive map of everyone I follow on Soundcloud—for you to explore as much or as little as you want.  Pan and zoom the canvas, or click on an artist to visit their Soundcloud.
            </div>
            <SoundcloudGraph/>
            <div class="p2">
                <ul class="first-ul">
                    <li>
                        The size of each artist tells how important they are to me.  How is that calculated?
                        <ul>
                            <li>How many of their tracks are in my <a href="https://soundcloud.com/fasteroid-1/likes">Likes</a>? (x{LIKES_SIZE_MUL})</li>
                            <li>My <a href="https://soundcloud.com/fasteroid-1/sets/sc-likes-legendary">Legendary Favorites</a> playlist? (x{FAVORITES_SIZE_MUL})</li>
                            <li>My <a href="https://soundcloud.com/fasteroid-1/sets/sc-likes-relics">Relics</a> playlist? (x{RELICS_SIZE_MUL})</li>
                        </ul>
                    </li>
                    <li>
                        Artists with a LOT of followers have more negative space around them.
                        <ul>
                            <li>This starts to become apparent around 250k</li>
                            <li>See <a href="https://soundcloud.com/porter-robinson">Porter Robinson</a></li>
                        </ul>
                    </li>
                    <li>
                        Graph edges (hover on a node) also show if two artists are following each other or not.
                        <ul>
                            <li>Bidirectional starts thick, goes thin, then ends thick again.</li>
                            <li>Single-direction follows start thick and taper into nothingness.</li>
                        </ul>
                    </li>
                    <li>
                        Plans to let you listen to a piece from each artist directly from this page are in the works!
                    </li>
                </ul>
            </div>
        </section>
    </div>
</body>