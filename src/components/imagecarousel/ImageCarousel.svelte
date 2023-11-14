
<script lang="ts">
    
    import { browser } from '$app/environment';

    import { UniqueIDs, assertExists, assertQueryExists } from '$lib/uniqueid';
    import type { CarouselImagePicker, CarouselImageData, AutoscrollProperties } from './carousel-common';

    import CarouselCaption from './carouselcaption/CarouselCaption.svelte';
    import { CarouselCaptionController } from './carouselcaption/carouselcaptioncontroller';

    import CarouselImage from './carouselimage/CarouselImage.svelte';
    import { CarouselImageController } from './carouselimage/carouselimagecontroller';
    
    export let source: CarouselImageData[];
    export let filter: CarouselImagePicker;

    export let size: number; // size of images

    export let autoscroll: AutoscrollProperties;

    const imageDataArray: CarouselImageData[] = filter(source);

    // this is needed for serverside prerender so we can render exactly one placeholder image
    // TODO: make sure this doesn't make multiple prerendered images if they show up in multiple carousels!
    imageDataArray[0].first = true;
    
    if (browser) {

        const easeTransition = {
            duration: autoscroll.transition,
            easing: "ease-in-out"
        }

        const captionControllers: CarouselCaptionController[] = [];
        const imageControllers:   CarouselImageController[] = [];

        const rack = assertExists( UniqueIDs.getClient('rack') );

        for (const imageData of imageDataArray) {          
            imageControllers.push(
                new CarouselImageController(UniqueIDs.getClient("image"), imageData)
            )
        }

        const buttons = assertExists( UniqueIDs.getClient('buttons') );
        const b_prev = assertQueryExists( buttons, ".prev" );
        const b_next = assertQueryExists( buttons, ".next" );

        captionControllers[0] = new CarouselCaptionController( UniqueIDs.getClient("caption") );
        captionControllers[1] = new CarouselCaptionController( UniqueIDs.getClient("caption") );
    
        let curIndex:   number = 0;     // which image is displayed?
        let curCaption: number = 0;     // which caption is visible?
        let busy:       boolean = false; // are we currently animating?
        let loop:       number = 0;  // interval for autoscroll if active
        let wait:       number = 0;  // delay for autoscroll if active


        function setImage(newIndex: number = 0, direction: number = 100){
            if (busy || curIndex === newIndex) {
                return;
            }
            
            busy = true;

            const newImage = imageControllers[newIndex];
            newImage.setVisible(true);
            newImage.setShift(direction);

            captionControllers[curCaption].fade(0, easeTransition);
            curCaption = (curCaption + 1) % 2;
            captionControllers[curCaption].fade(100, easeTransition);
            captionControllers[curCaption].setData(newImage.data);

            rack.animate( [{left: `${-direction}%`}], easeTransition ).addEventListener("finish",() => {
                const oldImage = imageControllers[curIndex];
                oldImage.setVisible(false);
                newImage.setShift(0);
                curIndex = newIndex;
                busy = false;
            })
        }

        function nextImage(offset: number){
            let next = (curIndex + offset) % imageDataArray.length;
            if( next < 0 ){ next += imageDataArray.length }
            setImage(next, offset * 100);
        }

        function stopScroll(){
            clearTimeout(wait);
            clearInterval(loop);
            wait = 0;
            loop = 0;
        }

        function autoScroll(startDelay: number){
            stopScroll();
            wait = window.setTimeout(
                () => {
                    stopScroll();
                    nextImage(+1)
                    loop = window.setInterval(() => {nextImage(+1)}, autoscroll.interval);
                },
                startDelay
            )
        }

        b_next.onclick = () => { nextImage(+1) }
        b_prev.onclick = () => { nextImage(-1) }
        
        buttons.onmouseenter = () => {
            stopScroll()
        }
        buttons.onmouseleave = () => {
            autoScroll(autoscroll.interval / 2)
        }

        autoScroll(autoscroll.delay)

    }
    
</script>

<style lang="scss">
    @import "./carousel.scss";
</style>

<div class="carousel" style="max-width: {size}px;">
    <div class="frame">
        <div class="rack" id={UniqueIDs.getServer('rack')}>
            {#each imageDataArray as image}
                <CarouselImage
                    id   = {UniqueIDs.getServer('image')}
                    data = {image}
                />
            {/each}
        </div>
        <div class="buttons" id={UniqueIDs.getServer('buttons')}>
            <button class="prev"/>
            <button class="next"/>
        </div>
    </div>
    <div class="captionholder">
        <CarouselCaption
            id    = {UniqueIDs.getServer('caption')}
            first = {imageDataArray[0]}
        />
        <CarouselCaption
            id    = {UniqueIDs.getServer('caption')}
        />
    </div>
</div>
