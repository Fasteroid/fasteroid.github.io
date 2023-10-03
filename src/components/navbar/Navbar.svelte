<script lang="ts">
    import { base } from "$app/paths";
    import { page } from '$app/stores';
    let pwd = $page.url.pathname;
</script>

<svelte:head>
    <style lang="scss">
        @import "./navbar.scss";
    </style>
</svelte:head>

<nav>
    <div class="home">
        <div class="home-wrapper">
            <div class="minecraftsplash">Now with Svelte!</div>
            <span>FAST'S CODE CREATIONS</span>
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
                        <img src="assets/icons/discord.svg" class="icon" alt=""/>
                        <span>Discord</span>
                    </a>
                    <a href="https://github.com/Fasteroid/" target="_blank">
                        <img src="assets/icons/github.svg" class="icon" alt=""/>
                        <span>Github</span>
                    </a>
                </div>
            </div>
        </div>
        <div class="dropdown">
            <div class:dropdown-head={true} class:cwd={`${base}/about`==pwd}>
                <a href="{base}/about">About Me</a>
            </div>
            <div class="dropdown-content">
                <div class="dropdown-onload-wrapper">
                    <a href="https://fasteroid.github.io/skilltree.html">
                        <span>Skill Tree</span>
                    </a>
                </div>
            </div>
        </div>
    </div>
</nav>
