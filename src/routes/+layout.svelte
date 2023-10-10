<script lang="ts">
    import Navbar from "../components/navbar/Navbar.svelte";
    import { page } from "$app/stores";
    import type { FullPageData } from "$lib/pagedata";

    $: pageData = $page.data as FullPageData; // needed for type safety
</script>

<svelte:head>
    <style lang="scss">
        @import "src/styles/global.scss";
    </style>
    <title>
        {pageData.titlePath.join(" | ")}
    </title>
</svelte:head>

<Navbar/>

<slot/>