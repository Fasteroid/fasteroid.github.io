<script lang="ts">
    import { browser } from '$app/environment';
    import { getHighlightedHTML } from './syntaxhighlighter';

    export let source: string;
    export let name: string;

    async function loadE2Code(){

        let resp = await fetch(source)
        let code = await resp.text()
        let html = getHighlightedHTML(code)

        let box = document.getElementById(name)
        if(box) box.innerHTML = html;
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

<section class="code-container" id={name}>
</section>