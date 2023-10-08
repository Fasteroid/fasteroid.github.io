<script lang="ts">
    import { page } from "$app/stores";
    import { pagetree } from "$lib/loader";
    let topic = "desmos";
    $: pageData = $page.data as FullPageData; // needed for type safety
</script>

<body>
    <div class="margins">
        <section>
            <section class="headerimage-border">
                <div class="headerimage" style="background-image: url('assets/desmos/banner.jpg');">
                    <hgroup>
                        <h1>{pageData.title} Projects</h1>
                    </hgroup>
                </div>
            </section>
            <section class="no-background">
                <div class="project-shelf">
                    {#each pagetree.getChildrenAtPath(`/${topic}`) as node}
                        <a href="{node.webPath}">
                            <img src="assets/{topic}/{node.pageData?.thumbnail ?? "portals.png"}" alt="thumbnail">
                            <div class="shortcut-title">{node.pageData?.longTitle || node.pageData?.title}</div>
                        </a>
                    {/each}
                </div>
            </section>
        </section>
    </div>
</body>