<script lang="ts">
    
    import { browser } from '$app/environment';
    import { base } from "$app/paths";
    import { UniqueIDs, assertExists } from "$lib/uniqueid";
    import { load } from './synths';

    import i_ptable from '$lib/atomicspectra/elements.json'
    import type { PTable } from '$lib/atomicspectra/types/native';

    const elements = (i_ptable as PTable).elements;

    UniqueIDs.start();

    if( browser ){

        const synths = load(); // SSR cannot witness this or it dies
        const master = new AudioContext();
        const voices = new synths.VoiceManager(master);

        for( const element of elements ){

            // We want to smoothly fade if they spam the button, but opening an audiocontext for every element at once will be too expensive.
            // TODO: VoiceManager class to manage this 

            const html: HTMLElement = assertExists( UniqueIDs.getClient('element') );

            html.addEventListener('mousedown', () => {
                voices.start(element)
            });

            html.addEventListener('mouseup', () => {
                voices.stop(element)
            });
        }
    }

</script>

<style lang="scss">
    @import "./ptable.scss";
</style>

<div class="margins">
    <section>
        <hgroup>
            <h2>Web Projects: Atomic Spectra Keyboard (WIP)</h2>
            <h3>WHAT IS THAT MELODY???</h3>
        </hgroup>
        <section class="extra-space">
            Click an element to hear its atomic spectra.<br>
            <br>
            <div class="ptable">
                {#each elements as element}
                    <div class="element" style="grid-column: {element.table_x}; grid-row: {element.table_y}" id={UniqueIDs.getServer("element")}>
                        {element.symbol}
                    </div>
                {/each}
            </div>
        </section>
    </section>
</div>
