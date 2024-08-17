<svelte:head>
    <style lang="scss">
        @import "./skilltree.scss";
        @import "./nodes.scss";
    </style>
</svelte:head>

<script lang="ts">
    import { browser } from "$app/environment";
    import { SkillTreeManager } from "./classes";
    import type { SkillTreeDataSet } from "./interfaces";
    import nodeDataset from "$lib/json/graph_skilltree.json"
    import Panzoom from "panzoom";

    if( browser ) {

        new SkillTreeManager(
            document.getElementById("template-node")!,
            document.querySelector(".node-container")!,
            document.querySelector(".lines-container")!,
            nodeDataset as SkillTreeDataSet
        );


        const canvas = document.getElementById("panzoom")!;

        const panzoom = Panzoom(canvas, {
            minZoom: 1, // no zoom for this one
            maxZoom: 1,
            bounds: true,
            boundsPadding: 0.9,
            beforeMouseDown(e) {
                const target = e.target as HTMLElement;
                return target.closest(".node") !== null;
            },
            beforeWheel(e) {
                return true; // no block on wheel
            }
        });

    }
</script>

<section class="stack grid">
    <canvas class="lines-container"/>   
    <div class="node-container" id="panzoom">
        
        <!-- template cell -->
        <div class="node" id="template-node" hidden>
            <div class="front">TEMPLATE</div>
            <div class="back">SAMPLE TEXT</div>
        </div>

    </div>        
</section> 