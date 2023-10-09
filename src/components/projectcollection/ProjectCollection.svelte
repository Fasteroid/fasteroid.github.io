<script lang="ts">
    import { page } from "$app/stores";
    import { pagetree } from "$lib/loader";
    export let topic: string;
    $: pageData = $page.data as FullPageData; // needed for type safety
    function sanitizeThumbnail(thumb: string | undefined): string {
        return `assets/${thumb ? `${topic}/${thumb}` : "placeholder.png"}`
    }
</script>

<div class="margins">
    <section>
        <section class="headerimage-border">
            <div class="headerimage" style="background-image: url('assets/{topic}/banner.jpg');">
                <hgroup>
                    <h1>{pageData.title} Projects</h1>
                </hgroup>
            </div>
        </section>
        <section class="no-background">
            <div class="project-shelf">
                {#each pagetree.getChildrenAtPath(`/${topic}`) as node}
                    <a href="{node.webPath}">
                        <img src="{ sanitizeThumbnail(node.pageData?.thumbnail) }" alt="thumbnail">
                        <div class="shortcut-title">{ node.pageData?.longTitle || node.pageData?.title }</div>
                    </a>
                {/each}
            </div>
        </section>
    </section>
</div>
