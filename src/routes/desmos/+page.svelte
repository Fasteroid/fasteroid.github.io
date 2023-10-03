
    
<svelte:head>
    <style lang="scss">
        @import "src/styles/projectshared.scss";
        @import "src/styles/projectdesmos.scss";
    </style>
    <title>Desmos Projects</title>
</svelte:head>

<component class="navbar" src="navbar.html"></component>

<body>
    <div class="margins">
        <section>
            <section class="headerimage-border">
                <div class="headerimage" style="background-image: url('assets/desmos/banner.jpg');">
                    <h1>
                        <b>Desmos Projects</b>
                    </h1>
                </div>
            </section>
            <section class="no-background">
                <div class="project-shelf">
                    <a href="desmos-galton-board.html">
                        <img src="assets/desmos/galtonboard.png" alt="thumbnail">
                        <div class="shortcut-title">Double Tangents</div>
                    </a>
                    <a href="desmos-portals.html">
                        <img src="assets/desmos/portals.png" alt="thumbnail">
                        <div class="shortcut-title">Double Tangents</div>
                    </a>
                    <a href="desmos-nearby-points.html">
                        <img src="assets/desmos/integralabuse.png" alt="thumbnail">
                        <div class="shortcut-title">Double Tangents</div>
                    </a>
                    <a href="desmos-double-tangents.html">
                        <img src="assets/desmos/doubletangents.png" alt="thumbnail">
                        <div class="shortcut-title">Double Tangents</div>
                    </a>
                </div>
            </section>
        </section>
    </div>
</body>