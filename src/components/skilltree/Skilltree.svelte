<svelte:head>
    <style lang="scss">
        @import "./skilltree.scss";
        @import "./nodes.scss";
    </style>
</svelte:head>

<script lang="ts">
    import { browser } from "$app/environment";
    import { SkillTreeManager2 } from "./classes";
    import type { SkillTreeDataSet2 } from "./interfaces";
    import nodeDataset from "$lib/json/graph_skilltree.json"

    if( browser ) {

        new SkillTreeManager2(
            document.getElementById("template-node")!,
            document.querySelector(".node-container")!,
            document.getElementById("tree-lines")!.children[0]! as SVGSVGElement,
            nodeDataset as SkillTreeDataSet2
        );

    }
</script>

<section class="grid">
    <div class="line-container" id="tree-lines">

        <svg class="tree-line-container"></svg>

    </div>     
    <div class="node-container">
        
        <!-- template cell -->
        <div class="node" id="template-node" hidden>
            <div class="front">TEMPLATE</div>
            <div class="back">SAMPLE TEXT</div>
        </div>

    </div>        
</section> 