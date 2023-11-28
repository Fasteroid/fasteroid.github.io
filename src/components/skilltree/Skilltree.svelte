<svelte:head>
    <style lang="scss">
        @import "./skilltree.scss";
        @import "./nodes.scss";
    </style>
</svelte:head>

<script lang="ts">
  import { browser } from "$app/environment";
  import { SkillTreeManager } from "./classes/managers";

    if(browser) {
        SkillTreeManager.setup(
            document.querySelector(".node-container")!,
            document.getElementById("template-node")!,
            document.getElementById("tree-lines")!.children[0]! as SVGSVGElement,
        )
    }
</script>

<section class="grid">
    <div class="line-container" id="tree-lines">
        <svg class="tree-line"></svg>
    </div>     
    <div class="node-container">
        
        <!-- template cell -->
        <div class="node" id="template-node" hidden>
            <div class="front">TEMPLATE</div>
            <div class="back">SAMPLE TEXT</div>
        </div>

    </div>        
</section> 