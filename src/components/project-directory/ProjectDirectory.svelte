<!-- 
    ProjectDirectory is a generalization of the BackgroundTitle + ProjectShelf combo most pages use.
-->

<script lang="ts">

    import { page } from "$app/stores";
    import { base } from "$app/paths";
    import { pagetree } from "$lib/pagetree";
    import BackgroundTitle from "../titlebar/BackgroundTitle.svelte";
    import type { FullPageData } from "$lib/pagedata";
  import ProjectShelf from "../project-shelf/ProjectShelf.svelte";

    /** The directory to look for projects in */
    export let directory: string;
    
    $: pageData = $page.data as FullPageData; // needed for type safety
    
    function sanitizeThumbnail(thumb: string | undefined): string {
        return `assets/${thumb ? `${directory}/${thumb}` : "placeholder.png"}`
    }
</script>

<style lang="scss">
    @forward "./project-directory.scss";
</style>

<div class="margins">
    <section>
        <BackgroundTitle background='{base}/assets/{directory}/banner.jpg'>
            {(pageData.longTitle ?? pageData.title) + " Adventures"}
        </BackgroundTitle>
        <ProjectShelf directory={directory}>
            <slot/>
        </ProjectShelf>
    </section>
</div>
