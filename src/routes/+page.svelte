<svelte:head>
    <meta http-equiv="refresh" content="3; url=/about">
</svelte:head>

<!-- TODO: implement a shell here where you can do stuff like `ls`, `cd`, etc. -->

<script lang="ts">
  import { browser } from "$app/environment";

    if( browser ){
        const countdown = document.getElementById("countdown")!
        let   seconds   = 3;
        window.setInterval(()=>{
            seconds--;
            countdown.innerHTML = seconds.toString()
        }, 1000)
    }
</script>


<div class="margins">
    <section>
        <hgroup class="taller">
            <h1>/</h1>
        </hgroup>
        <section class="extra-space">
            There's nothing here... sending you to <a href="./about">./about</a> in <span id="countdown">3</span> seconds...
        </section>
    </section>
</div>
