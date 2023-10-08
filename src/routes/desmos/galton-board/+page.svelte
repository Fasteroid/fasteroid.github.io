<div class="margins">
    <section>
        <hgroup>
            <h2>Galton Board</h2>
            <h3>Does that curve ring any <i>bells?</i></h3>
        </hgroup>
        <section class="extra-space">
            <iframe src="https://www.desmos.com/calculator/q0zasmg9jo" style="width: 100%; height: 50vh" frameborder=0 title="graph"></iframe>
        </section>
        <section class="extra-space">
            <iframe 
                style="float:right; max-width: 100%; width: 400px; height: 400px; margin: 0px 0px 15px 15px"
                src="https://www.youtube-nocookie.com/embed/Kq7e6cj2nDw" 
                title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope">
            </iframe>
            Predictability arising from randomness?  What is this, did I somehow reverse-engineer Desmos's RNG, or is this real?<br>
            <br>
            While reverse-engineering RNG would have been really cool, no, I didn't have to do that for this graph—all I needed was statistics.  
            Just like the physical variant shown to the right, this digital Galton board (also called a quincunx or bean-machine) demonstrates 
            two statistical phenomenon: regression to the mean and central limit theorem.<br>
            <br>
            First, I'll explain regression to the mean—the balls are less likely to bounce towards the outside since there are actually less
            paths that take the balls there.  Consider a 4-tiered pegboard like the default configuration for this graph.  To reach the leftmost slot, the 
            <b>ONLY</b> way to get there is to bounce left four times, which has a <b>1 in 16</b> probability if bouncing left is equally as likely 
            as bouncing right.  By contrast, there are <b>6 unique ways</b> to reach the middle slot (can you count them all?)—a <b>6 in 16</b> probability.  
            As a result, the balls are biased to be closer to the center.<br>
            <br>
            Secondly, central limit theorem—it is well known among staticians that over many samples of an unknown distribution, the mean tends to
            approximate a normal distribution.  Our Galton board with 100 balls is really just 100 random samples from an unknown sampling, so
            central limit theorem applies in this case.  As a result, both my digital version (where collisions follow a perfect binomial distribution) AND the physical board with 
            chaotic physics-based distribution produce bell curves.<br>
            <br>
            This graph won me a Reddit platinum award on <a href="https://www.reddit.com/r/desmos/comments/hhv5a3/galton_board_w_physics/">r/desmos</a>.<br>
            <div style="clear: both;"></div>
        </section>
    </section>
</div>
