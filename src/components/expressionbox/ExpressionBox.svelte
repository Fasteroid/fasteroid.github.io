<script lang="ts">
    import { browser } from '$app/environment';
   
    if (browser) {
        const balls = document.querySelector('#balls');
        balls!.innerHTML = "yo wtf"
    }
</script>
<div id="balls">lol</div>