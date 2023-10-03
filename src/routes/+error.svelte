<script lang="ts">
    import { base } from "$app/paths";
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
            <h1>
                <b>404</b>
            </h1>
            <div class="error-centerer">
                <img src="{base}/assets/404.gif" alt="bikini atoll explosion">
            </div>
        </section>
    </div>
</body>