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
            if( !element.spectra ) continue; // skip elements without spectra, eg. rutherfordium
            const html: HTMLElement = assertExists(element.name);

            html.addEventListener('mousedown', () => {
                voices.start(element)
            });
        }

        document.addEventListener('mouseup', (e) => { // if you drag off of something and release, we still want to stop all sounds
            voices.stopAll();
        });
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
                    <div class="{element.spectra ? 'playable' : ''} {element.category} element" style="grid-column: {element.table_x}; grid-row: {element.table_y}" id={element.name}>
                        {element.symbol}
                    </div>
                {/each}
            </div>
        </section>
    </section>
</div>
