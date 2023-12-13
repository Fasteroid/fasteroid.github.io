<script lang="ts">
    import { base } from "$app/paths";
  import Skilltree from "../../../components/skilltree/Skilltree.svelte";
</script>

<body>
    <div class="margins">
        <section>
            <hgroup>
                <h1>Technical Skill Tree</h1>
            </hgroup>
            <div class="p">
                Welcome to the skill tree, now complete with physics!<br>
                <br>
                &emsp;&emsp;In many video games, trees are used as progression systems.  The game developer chooses a root node,
                and the player is then left to choose which branches to explore first.  The player also often given only a limited
                number of branches to explore.  This means there is strategy involved in growing the tech tree—will you be a 
                one-trick pony, or a jack of all trades and master of none?<br>
                <br>
                I've chosen to specialize in primarily in computer science, but my creative side has historically gotten the best
                of me on the engineering and a/v branches.<br>
                <br>
                Roll over or tap a node to see its description.  You can also drag them around if they get stuck or tangled.
            </div>
            <Skilltree/>        
        </section>
    </div>
</body>