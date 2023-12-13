<script lang="ts">
    import type { PrefixedIntStr } from '$lib/uniqueid';
    import type { CarouselImageData } from '../carousel-common';
    export let id: PrefixedIntStr;
    export let first: CarouselImageData | undefined = undefined;
</script>

<style lang="scss">
    @import "./carouselcaption.scss";
</style>

<div id="{id}" class="carousel-caption {first ? '':'hidden'}">
    <div class="title">{first?.title}</div>
    <div class="capt1">{first?.capt1}</div>
    <div class="capt2">{first?.capt2}</div>
</div>