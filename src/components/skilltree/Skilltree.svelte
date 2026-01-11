<svelte:head>
    <style lang="scss">
        @forward "./skilltree.scss";
        @forward "./nodes.scss";
    </style>
</svelte:head>

<script lang="ts">
    import { browser } from "$app/environment";
    import type { SkillTreeDataSet } from "./interfaces";
    import nodeDataset from "$lib/json/graph_skilltree.json"

    if( browser ) {

        ( async () => {
            const { SkillTreeManager2 } = await import( "./classes" );

            console.log(SkillTreeManager2)

            new SkillTreeManager2(
                document.getElementById("template-node")!,
                document.querySelector(".node-container")!,
                document.querySelector(".lines-container")!,
                nodeDataset as SkillTreeDataSet
            );
        } )();
        
    }
</script>

<section class="stack grid">
    <canvas class="lines-container"/>   
    <div class="node-container" id="panzoom">
        
        <!-- template cell -->
        <div class="node" id="template-node">
            <div class="front">TEMPLATE</div>
            <div class="back">SAMPLE TEXT</div>
        </div>

    </div>        
</section> 