<script lang="ts">
    import { page } from '$app/stores';
    import { base } from "$app/paths";
    import { pagetree } from '$lib/pagetree';
        
    const currentPage = $page.url.pathname;
    function isActive(page: string): boolean {
        return currentPage.startsWith(page)
    }
</script>

<style lang="scss">
    @import "./navbar.scss";
</style>

<nav>
    <div class="home">
        <div class="home-wrapper">
            <span>FAST'S CODE CREATIONS</span>
            <div class="minecraftsplash">Now with Svelte!</div>
        </div>
    </div>
    <div class="pages">
        <div class="dropdown">
            <div class="dropdown-head">
                <span>Links</span>
            </div>
            <div class="dropdown-content">
                <div class="dropdown-onload-wrapper">
                    <a href="https://discord.com/users/276913653230469122/" target="_blank">
                        <img src="{base}/assets/icons/discord.svg" class="icon" alt=""/>
                        <span>Discord</span>
                    </a>
                    <a href="https://github.com/Fasteroid/" target="_blank">
                        <img src="{base}/assets/icons/github.svg" class="icon" alt=""/>
                        <span>Github</span>
                    </a>
                </div>
            </div>
        </div>
        {#each pagetree.getChildren() as main}
            <div class="dropdown">
                <div class:dropdown-head={true} class:active={isActive(main.webPath)}>
                    <a href='{main.webPath}'>{main.pageData.title}</a>
                </div>
                {#if main.getChildren()}
                    <div class="dropdown-content">
                        <div class="dropdown-onload-wrapper">
                            {#each main.getChildren() as sub}
                                <a href="{sub.webPath}" class:active={isActive(`${sub.webPath}`)}>
                                    <span>{sub.pageData.title}</span>
                                </a>
                            {/each}
                        </div>
                    </div>
                {/if}
            </div>
        {/each}
    </div>
</nav>
