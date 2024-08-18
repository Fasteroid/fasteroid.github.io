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

    if( browser ) {

        new SkillTreeManager(
            document.getElementById("template-node")!,
            document.querySelector(".node-container")!,
            document.querySelector(".lines-container")!,
            nodeDataset as SkillTreeDataSet
        );

    }
</script>

<section class="stack grid">
    <canvas class="lines-container" style="background-color: red;"/>   
    <div class="node-container">
        
        <!-- template cell -->
        <div class="node" id="template-node" hidden>
            <div class="front">TEMPLATE</div>
            <div class="back">SAMPLE TEXT</div>
        </div>

    </div>        
</section> 