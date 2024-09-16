<script lang="ts">
    import { base } from "$app/paths";
    import SoundcloudGraph from "../../../components/soundcloudgraph/SoundcloudGraph.svelte";
</script>

<body>
    <div class="margins">
        <section>
            <hgroup>
                <h1>Soundcloud Map [BETA]</h1>
            </hgroup>
            <div class="p">
                This page is an attempt to show the relationships between artists I follow on Soundcloud.<br/>
                <br/>
                Every following forms an edge in the graph which pulls its participants closer together—which
                after some time will pull the whole graph into a semi-stable configuration.<br/>
                The resulting spatial layout can then be used to infer various social structures such as bands, communities, and collectives.<br/>
                <br/>
                This graph can be panned and zoomed by dragging and scrolling, or by touch if you're on mobile.<br/>
                Clicking or tapping an artist will bring you to their soundcloud page in a new tab.<br/>
                Hovering an artist will reveal their edges and increase the forces to show how they connect to the bigger picture.<br/>
            </div>
            <SoundcloudGraph/>        
        </section>
    </div>
</body>