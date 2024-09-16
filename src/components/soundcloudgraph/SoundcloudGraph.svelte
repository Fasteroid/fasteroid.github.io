<svelte:head>
    <style lang="scss">
        @import "./soundcloudgraph.scss";
    </style>
</svelte:head>

<script lang="ts">
    import { browser } from "$app/environment";
    import { SoundcloudGraphManager } from "./classes";
    import nodeDataset                     from "$lib/soundcloud/followermap.json"
    import type { SoundcloudGraphDataset } from "$lib/soundcloud/types/native";

    if( browser ) {

        new SoundcloudGraphManager(
            document.getElementById("template-node")!,
            document.querySelector(".node-container")!,
            document.querySelector(".lines-container")!,
            nodeDataset as SoundcloudGraphDataset,
        );
        
    }
</script>

<section class="stack grid">
    <canvas class="lines-container"/>   
    <div class="node-container" id="panzoom">
        
        <!-- template cell -->
        <div class="node initial" id="template-node" hidden>
            <div class="stack artist">
                <div class="text-outline">b</div>
                <div class="text-main">a</div>
            </div>
        </div>

    </div>        
</section> 