<!-- 
    ProjectShelf is a component that scans a specific subdirectory of `routes` and displays projects found under it.
-->

<script lang="ts">
    import { pagetree } from "$lib/pagetree";

    /** Directory to look for projects in */
    export let directory: string;

    function sanitizeThumbnail(thumb: string | undefined): string {
        return `assets/${thumb ? `${directory}/${thumb}` : "placeholder.png"}`
    }
</script>

<style lang="scss" >
    @forward "./project-shelf.scss";
</style>

<div class="project-shelf">
    <slot/>
    {#each pagetree.getChildrenAtPath(`/${directory}`) as node}
        <a href="{node.webPath}">
            <img src="{ sanitizeThumbnail(node.pageData?.thumbnail) }" alt="thumbnail">
            <div class="project-title">{ node.pageData?.longTitle || node.pageData?.title }</div>
        </a>
    {/each}
</div>



