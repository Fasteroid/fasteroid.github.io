<script lang="ts">
    import { page } from '$app/stores';
    import { base } from "$app/paths";
    import { pagetree } from '$lib/pagetree';
    import pagelinks from '$lib/json/pagelinks.json'
    import { TreeNode } from '$lib/treelib';
        
    $: currentPage = $page.url.pathname;

    // this second arg might look stupid, but it's required for reactivity
    function isActive(page: string, currentPage: string): boolean {
        return currentPage.startsWith(page)
    }

</script>

<style lang="scss">
    @import "./navbar.scss";
</style>

<nav>
    <div class="home">
        <span>
            <span class="glowy">FAST'S CODE CREATIONS</span>
            <a class="minecraftsplash" href="https://svelte.dev">Now with Svelte!</a>
        </span>
    </div>
    <div class="right">
        <div class="dropdown">
            <div class="top">
                <span>Links</span>
            </div>
            <div class="tray real-entries">
                {#each pagelinks as link}
                    <a href="{link.url}">
                        <span>{link.title}</span>
                    </a>
                {/each}
            </div>
            <div class="tray width-enforcers">
                {#each pagelinks as dummy}
                    <span>{dummy.title}</span>
                {/each}
            </div>
        </div>
        {#each pagetree.getChildren() as main}
            <div class="dropdown">
                <a class:top={true} class:active={isActive(main.webPath, currentPage)} href='{main.webPath}'>
                    <span>{main.pageData.title}</span>
                </a>
                {#if main.getChildren()}
                    <div class="tray real-entries">
                        {#each main.getChildren() as sub}
                            <a href="{sub.webPath}" class:active={isActive(`${sub.webPath}`, currentPage)}>
                                <span>{sub.pageData.title}</span>
                            </a>
                        {/each}
                    </div>
                {/if}
            </div>
        {/each}
    </div>
</nav>
<!--  -->