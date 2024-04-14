<script lang="ts">
    
    import { browser } from '$app/environment';
    import { base } from "$app/paths";
    import { UniqueIDs, assertExists } from "$lib/uniqueid";
    import { load } from './synths';
    import { ELEMENT_NAMES } from '$lib/atomicspectra/types';

    UniqueIDs.start();

    if( browser ){

        const synths = load(); // SSR cannot witness this or it dies

        const button: HTMLElement = assertExists( UniqueIDs.getClient('test_button') );

        button.addEventListener('click', () => {
            const ctx = new AudioContext();

            const elem = Math.floor(1 + Math.random() * 99)

            const osc = new synths.AtomicSpectraNode(ctx, elem);
            console.log( ELEMENT_NAMES[elem-1] )

            osc.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 1);
        });

    }

</script>

<div class="margins">
    <section>
        <hgroup>
            <h2>Web Projects: Atomic Spectra Keyboard</h2>
            <h3>WHAT IS THAT MELODY???</h3>
        </hgroup>
        <section class="extra-space">
            <button id="{UniqueIDs.getServer('test_button')}">Test</button>
        </section>
    </section>
</div>
