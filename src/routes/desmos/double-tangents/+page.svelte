<div class="margins">
    <section>
        <hgroup>
            <h2>Double Tangents</h2>
            <h3>Surprisingly hard to find!</h3>
        </hgroup>
        <section class="extra-space">
            <iframe src="https://www.desmos.com/calculator/fzkirc0j4l" style="width: 100%; height: 50vh" frameborder=0 title="graph"></iframe>
        </section>
        <section class="extra-space">
            This is another technical graph.  How do you find all tangent lines on an arbitrary function <i>f(x)</i> that are tangent to multiple points?<br>
            <br>
            Short answer: <i>Not easily</i>.  It's really hard!<br>
            <br>
            Long answer: Desmos regressions, solution space, fitness functions, and other dark magic!<br>
            <br>
            This graph uses a set of several rules to evaluate whether a pair of two x values
            should be considered a double tangent or not.  These are then summed together and fed into
            a regression solver to try and find the best fitting pair.  These are easy to summarize in English:<br>
            <br>
            <section>
                <ul>
                    <li>The slope at both points should the same.</li>
                    <li>The tangent line should not match any we already know of.</li>
                    <li>Tangent lines along straight sections of the graph are boring and should be avoided.</li>
                    <li>Ignore half of the solutions since they're duplicates.</li>
                    <li>Don't look near points we've already found to be on a double tangent.</li>
                </ul>
            </section>
            <br>
            Of course if only it were actually that easy.  Desmos regressions are really good, but they're not
            all-knowing enough to find tiny point solutions in a sea of infinite possibilites.  So what do we do?<br>
            <br>
            The answer, as with most things in life, is that things are never black and white, and that the gray areas
            should not be neglected.  So in the actual graph, these rules have simply been revised into continuously 
            differentiable versions of themselves.  This results in a more continuous solution space.<br>
            <br>
            Desmos does a lot better with this.  It still needs an occasional push to stop it from getting stuck
            in local minima, but it does well enough to find <i>most</i> of the solutions within a reasonable time.<br>
            <br>
            Wait, are we still talking about Desmos?  Why am I describing myself?!
        </section>
    </section>
</div>
