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

        for( const element of elements ){

            // We want to smoothly fade if they spam the button, but opening an audiocontext for every element at once will be too expensive.
            // TODO: VoiceManager class to manage this 

            const html: HTMLElement = assertExists( UniqueIDs.getClient('element') );
            html.addEventListener('click', () => {
                const ctx = new AudioContext();

                const osc = new synths.AtomicSpectraNode(ctx, element);

                osc.connect(ctx.destination);

                osc.gain.setValueAtTime(1, ctx.currentTime);
                osc.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
                osc.start();
                setTimeout(() => { 
                    ctx.close();
                }, 500);
            });
        }

        const synths = load(); // SSR cannot witness this or it dies

        // const button: HTMLElement = assertExists( UniqueIDs.getClient('test_button') );

        // button.addEventListener('click', () => {
        //     const ctx = new AudioContext();

        //     const elem = Math.floor(1 + Math.random() * 99)

        //     const osc = new synths.AtomicSpectraNode(ctx, elem);
        //     console.log( ELEMENT_NAMES[elem-1] )

        //     osc.connect(ctx.destination);

        //     osc.start();
        //     osc.stop(ctx.currentTime + 5);
        // });

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
