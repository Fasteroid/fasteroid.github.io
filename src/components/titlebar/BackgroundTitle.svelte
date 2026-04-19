
<script lang="ts">
    /** Path to the background image */
    export let background: string;
</script>

<style lang="scss">
    @forward "./backgroundtitle.scss";
</style>

<section class="bgtitle">
    <div class="bg" style="background-image: url('{background}');">
        <hgroup>
            <slot/>
        </hgroup>
    </div>
</section>