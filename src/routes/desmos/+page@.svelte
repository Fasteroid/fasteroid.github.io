<svelte:head>
    <style lang="scss">
        @import "src/styles/projectshared.scss";
        @import "src/styles/projectdesmos.scss";
    </style>
</svelte:head>


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
                    <h1>
                        <b>{pageData.title} Projects</b>
                    </h1>
                </div>
            </section>
            <section class="no-background">
                <div class="project-shelf">
                    {#each pagetree.getPathChildren(`/${topic}`) as node}
                        <a href="{node.webPath}">
                            <img src="assets/{topic}/{node.pageData?.thumbnail ?? "portals.png"}" alt="thumbnail">
                            <div class="shortcut-title">{node.pageData?.title}</div>
                        </a>
                    {/each}
                </div>
            </section>
        </section>
    </div>
</body>