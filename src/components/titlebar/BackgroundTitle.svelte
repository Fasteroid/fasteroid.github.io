<script lang="ts">
    export let title: string;
    export let background: string;
</script>

<style lang="scss">
    @import "./backgroundtitle.scss";
</style>

<section class="bgtitle">
    <div class="bg" style="background-image: url('{background}');">
        <hgroup>
            <h1>{title}</h1>
        </hgroup>
    </div>
</section>