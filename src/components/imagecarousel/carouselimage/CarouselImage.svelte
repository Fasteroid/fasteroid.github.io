<script lang="ts">
  import { base } from '$app/paths';
    import type { PrefixedIntStr } from '$lib/uniqueid';
    import type { CarouselImageData } from '../carousel-common';
    export let id:   PrefixedIntStr;
    export let data: CarouselImageData
</script>

<style lang="scss">
    @import "./carouselimage.scss";
</style>

<div id="{id}" class="carousel-image {data.first ? "" : "hidden"}">
    <img src="{base}/{data.file}" alt="{data.capt2}" class="image">
</div>