<script lang="ts">
    import Navbar from "../components/navbar-rewrite/Navbar.svelte";
    import { page } from "$app/stores";
    import type { FullPageData } from "$lib/pagedata";

    $: pageData = $page.data as FullPageData; // needed for type safety
</script>

<svelte:head>
    <style lang="scss">
        @import "src/globalstyle/global.scss";
    </style>
    <title>
        {pageData.titlePath.join(" | ")}
    </title>
</svelte:head>

<body>
    <Navbar/>

    <slot/>
</body>
