<script lang="ts">
    
    import { browser } from '$app/environment';
    import { base } from "$app/paths";
    
    if( browser ){

        // based on this: https://www.bryanbraun.com/2021/03/24/infinitely-nested-iframes/

        const iframeEl = document.querySelector('iframe')!;
        const nextQueryValue = !location.search ? 1 : Number(location.search.split("?").pop()) + 1;


        iframeEl.src = `${base}?${nextQueryValue}#wtf`;

    }

</script>

<style lang="scss">
    @import "./iframe.scss";
</style>

<div class="margins">
    <section>
        <hgroup>
            <h2>Web Experiments: Recursive &lt;iframe&gt;</h2>
            <h3>Test your browser!</h3>
        </hgroup>
        <section class="extra-space">
            <div class="iframe-aligner">
                <iframe title="wtf"></iframe>
            </div>
        </section>
        <section class="extra-space">
            This page is a demonstration of how NOT to use the <code>&lt;iframe&gt;</code> tag.<br>
            <br>
            Normally, this tag is used by developers to embed websites within other websites.  On this portfolio site for instance, I use them to embed Desmos graphs on the Desmos project pages.  
            That way, you can interact with the graphs without leaving the page.<br>
            <br>
            <i>But what if you embedded a website within itself?  </i>  Well, you'd get exactly what you're seeing above.<br>
            <br>
            Better leave this page before your browser crashes... there is not a cap on the recursion!
        </section>
    </section>
</div>
