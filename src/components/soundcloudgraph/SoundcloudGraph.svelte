<svelte:head>
    <style lang="scss">
        @forward "./soundcloudgraph.scss";
    </style>
    <script src="https://w.soundcloud.com/player/api.js"></script>
</svelte:head>

<script lang="ts">
    import { browser }                     from "$app/environment";
    import { SoundcloudGraphManager }      from "./classes";
    import type { SoundcloudGraphDataset } from "$lib/soundcloud/types_native";
    import { loadDynamicJSON } from "$lib/utils";

    if( browser ) {

        loadDynamicJSON<SoundcloudGraphDataset>("data.soundcloud", "graph_soundcloud_v2.json").then( dataset => {
            new SoundcloudGraphManager(
                document.getElementById("template-node")!,
                document.querySelector(".node-container")!,
                document.querySelector(".lines-container")!,
                dataset,
            );
        } )
        
    }
</script>

<section class="stack grid">
    <canvas class="lines-container"/>   
    <div class="node-container" id="panzoom">
        
        <!-- template cell -->
        <div class="node initial" id="template-node" hidden>
            <div class="scale">
                <div class="stack artist">
                    <img alt="">
                    <div class="text-outline">b</div>
                    <div class="text-main">a</div>
                </div>
                <!-- todo: experiment with creating this element lazily -->
                <div class="descriptor">
                    <div class="inside">
                        <div class="text-bio noflex">placeholder</div>
                        <div></div>
                        <div class="featured-track noflex">
                            Featured Track: <span class="text-featured-track">placeholder</span>
                        </div>
                    </div>
                </div>
                <!-- It would make much more sense to put this in the descriptor, but browser rendering is fucking stupid -->
                <div class="iframe-holder noflex">
                    <div class="iframe-placeholder"></div>
                </div>
            </div>
        </div>

        <!-- template iframe -->
        <iframe id="template-embed"
            scrolling="no" 
            frameborder="no" 
            allow="autoplay" 
            src=""
            title="embed"
            hidden
        >

        <!-- <div style="display: flex; align-items: center; justify-content: center; pointer-events: none; position: absolute;">x</div> -->

    </div>        
</section> 