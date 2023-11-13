
<script lang="ts">
    
    import { browser } from '$app/environment';

    import { UniqueIDs, assertExists } from '$lib/uniqueid';
    import type { CarouselImagePicker, CarouselImageData } from './carousel-common';

    import CarouselCaption from './carouselcaption/CarouselCaption.svelte';
    import { CarouselCaptionController } from './carouselcaption/carouselcaptioncontroller';

    import CarouselImage from './carouselimage/CarouselImage.svelte';
    import { CarouselImageController } from './carouselimage/carouselimagecontroller';
    
    export let source: CarouselImageData[];
    export let filter: CarouselImagePicker;
    export let size:   number;

    const transition = 250
    const imageDataArray: CarouselImageData[] = filter(source);

    // this is needed for serverside prerender so we can render exactly one placeholder image
    // TODO: make sure this doesn't make multiple prerendered images if they show up in multiple carousels!
    imageDataArray[0].first = true;
    
    if (browser) {

        let captionControllers: CarouselCaptionController[] = [];
        let imageControllers: CarouselImageController[] = [];
        let frame:       HTMLElement;
        let rack:        HTMLElement;
        let button_next: HTMLElement;
        let button_prev: HTMLElement;

        let curIndex = 0;
        let curCaption = 0;
        let busy = false;

        function getRackAnim(direction: number){
            return [ {left: `${-direction}%`} ]
        }

        function setImage(newIndex: number = 0, direction: number = 100){
                       
            if (busy || curIndex === newIndex) {
                return;
            }
            
            busy = true;

            const newImage = imageControllers[newIndex]
            newImage.setVisible(true)
            newImage.setShift(direction)

            captionControllers[curCaption].fade(0, transition)
            curCaption = (curCaption + 1) % 2
            captionControllers[curCaption].fade(100, transition)
            captionControllers[curCaption].setData(newImage.data)

            rack.animate( getRackAnim(direction), transition ).addEventListener("finish",() => {
                const oldImage = imageControllers[curIndex]
                oldImage.setVisible(false)
                newImage.setShift(0)
                curIndex = newIndex
                busy = false;
            })

        }

        function nextImage(offset: number){
            let next = (curIndex + offset) % imageDataArray.length;
            if( next < 0 ){ next += imageDataArray.length }
            setImage(next, offset * 100)
        }

        frame = assertExists( document.getElementById(UniqueIDs.prefix('frame')) )
        rack  = assertExists( document.getElementById(UniqueIDs.prefix('rack')) )

        for (const imageData of imageDataArray) {
            imageControllers.push(
                new CarouselImageController(UniqueIDs.prefix("image"), imageData)
            )
        }

        button_prev = assertExists( document.getElementById(UniqueIDs.prefix('button_prev')) )
        button_prev.onclick = () => { nextImage(-1) }
        button_next = assertExists( document.getElementById(UniqueIDs.prefix('button_next')) )
        button_next.onclick = () => { nextImage(+1) }

        captionControllers[0] = new CarouselCaptionController( UniqueIDs.prefix("caption") )
        captionControllers[1] = new CarouselCaptionController( UniqueIDs.prefix("caption") )
        
        console.log(imageControllers)
        console.log(captionControllers)
        
        setInterval(
            () => {

            }, 
            2500
        )
        
    }
    
</script>

<style lang="scss">
    @import "./carousel.scss";
</style>

<div class="carousel" style="max-width: {size}px;">
    <div class="frame" id={UniqueIDs.prefix('frame')}>
        <div class="rack" id={UniqueIDs.prefix('rack')}>
            {#each imageDataArray as image}
                <CarouselImage
                    id   = {UniqueIDs.prefix('image')}
                    data = {image}
                />
            {/each}
        </div>
        <div class="buttons">
            <button
                id = {UniqueIDs.prefix('button_prev')}
            />
            <button
                id = {UniqueIDs.prefix('button_next')}
            />
        </div>
    </div>
    <div class="captionholder">
        <CarouselCaption
            id    = {UniqueIDs.prefix('caption')}
            first = {imageDataArray[0]}
        />
        <CarouselCaption
            id    = {UniqueIDs.prefix('caption')}
        />
    </div>
</div>
