<script lang="ts">
    import { base } from "$lib/base";
    import { page } from '$app/stores';
</script>

<svelte:head>
    <title>OH NAR</title> 
    <style lang="scss">
        @import "src/styles/goofy404.scss";
    </style>
</svelte:head>

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