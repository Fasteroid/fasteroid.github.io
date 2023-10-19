<script lang="ts">
    import { browser } from '$app/environment';
  import { applySyntaxHighlight } from './syntaxhighlighter';

    export let source: string;
    let box: HTMLElement;

    console.log(source)

    async function loadE2Code(){
        let resp = await fetch(source)
        let data = await resp.text()
        box.innerText = data;
        applySyntaxHighlight(box);
    }

    if (browser) {
        loadE2Code()
    }
</script>
<svelte:head>
    <style lang="scss">
        @import "./expression2.scss";
    </style>
</svelte:head>

<section bind:this={box} class="code-container" >
</section>