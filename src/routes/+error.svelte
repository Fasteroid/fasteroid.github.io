<script lang="ts">
    import { base } from "$app/paths";
    import { page } from '$app/stores';
</script>

<svelte:head>
    <title>OH NAR</title> 
</svelte:head>

<style lang="scss">
    @import "./404.scss";
</style>

<body>
    <div class="margins">
        <section>
            <hgroup>
                <h1>{$page.status}</h1>
            </hgroup>
            <div class="error-centerer">
                <img src="{base}/assets/404.gif" alt="bikini atoll explosion">
            </div>
        </section>
    </div>
</body>