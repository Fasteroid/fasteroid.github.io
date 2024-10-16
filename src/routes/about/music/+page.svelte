<script lang="ts">
    import { base } from "$app/paths";
    import { FAVORITES_SIZE_MUL, LIKES_SIZE_MUL, RELICS_SIZE_MUL } from "../../../components/soundcloudgraph/classes";
    import SoundcloudGraph from "../../../components/soundcloudgraph/SoundcloudGraph.svelte";

    const legendaryFavoritesDesc = "A competitive catalogue, limited to my top 30 with a max of 3 per artist."
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
                <h1>Map of Musicians</h1>
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
                And I get embarassed every time someone asks!  It's impossible to describe every niche subgenres of electronic music I've fallen in love with over the years.  
                I don't even have a clear favorite artist!<br/>
                <div class="minibr"></div>
                Instead of me trying to describe my musical tastes, why not explore them for yourself?
            </div>
            <SoundcloudGraph/>
            <div class="p2">
                For the especially curious, here are some more technical details about what this visualization is showing:
                <ul class="first-ul">
                    <li>
                        The size of each artist tells how important they are to me.  How is that calculated?
                        <ul>
                            <li>
                                How many of their tracks are in my 
                                <a href="https://soundcloud.com/fasteroid-1/likes" title="Anything I liked enough to listen to again.">Likes</a>? 
                                (x{LIKES_SIZE_MUL})</li>
                            <li>
                                ...plus in my 
                                <a href="https://soundcloud.com/fasteroid-1/sets/sc-likes-legendary" title={legendaryFavoritesDesc}>Legendary Favorites</a> 
                                playlist (x{FAVORITES_SIZE_MUL})
                            </li>
                            <li>
                                ...plus in my 
                                <a href="https://soundcloud.com/fasteroid-1/sets/sc-likes-relics" title="A playlist of nostalgia containing tracks from 9th grade and earlier.">Relics</a>
                                playlist (x{RELICS_SIZE_MUL})
                            </li>
                        </ul>
                    </li>
                    <li>
                        Almost every artist here has a featured track.  How am I picking those?
                        <ul>
                            <li>For most tracks, popularity is determined as a combination of plays, likes, and comments squared divided by age.</li>
                            <li>
                                If the track is in my
                                <a href="https://soundcloud.com/fasteroid-1/sets/sc-likes-legendary" title={legendaryFavoritesDesc}>Legendary Favorites</a> playlist,
                                it is "timeless", and will divide by its ranking there instead of age.
                            </li>
                            <li>This means if there's not a significant difference in stats, Legendary Favorites are preferred.  <i>But not always.</i></li>
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
                </ul>
            </div>
        </section>
    </div>
</body>