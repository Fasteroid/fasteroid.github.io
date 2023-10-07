<script lang="ts">
    import { base } from "$app/paths";
    import { page } from '$app/stores';

    type NavbarPage = {
        title: string,
        index: string,        
    }

    type NavbarHeader = {
        title: string,
        index?: string,
        pages?: NavbarPage[]
    }
    
    // TODO: make this use the page tree.
    let navbarContents: NavbarHeader[] = [
        {
            title: "About Me",
            index: "about",
        },    
        {
            title: "Desmos",
            index: "desmos",
            pages: [
                { title: "Portals", index: "portals" }
            ]
        }
    ]

    const currentPage = $page.url.pathname;
    function isActive(page: string): boolean {
        return currentPage.startsWith(page)
    }

</script>

<svelte:head>
    <style lang="scss">
        @import "./navbar.scss";
    </style>
</svelte:head>

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
        {#each navbarContents as main}
            <div class="dropdown">
                <div class:dropdown-head={true} class:active={isActive(`${base}/${main.index}`)}>
                    {#if main.index}
                        <a href='{base}/{main.index}'>{main.title}</a>
                    {:else}
                        <span>{main.title}</span>
                    {/if}
                </div>
                {#if main.pages}
                    <div class="dropdown-content">
                        <div class="dropdown-onload-wrapper">
                            {#each main.pages as sub}
                                <a href="{base}/{main.index}/{sub.index}" class:active={isActive(`${base}/${main.index}/${sub.index}`)}>
                                    <span>{sub.title}</span>
                                </a>
                            {/each}
                        </div>
                    </div>
                {/if}
            </div>
        {/each}
    </div>
</nav>
