
<script>
    import Navbar from "../components/navbar/Navbar.svelte";
</script>

<svelte:head>
    <style lang="scss">
        @import "src/styles/global.scss";
    </style>
</svelte:head>

<Navbar/>

<slot/>