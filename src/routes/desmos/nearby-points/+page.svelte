<div class="margins">
    <section>
        <hgroup>
            <h2>Nearby Points</h2>
            <h3>Leveraging integration for profit!</h3>
        </hgroup>
        <section class="extra-space">
            <iframe src="https://www.desmos.com/calculator/olyzbiymc0" style="width: 100%; height: 50vh" frameborder=0 title="graph"></iframe>
        </section>
        <section class="extra-space">
            This is a technical graph.  It demonstrates a task that is trivially simple to explain but rather difficult
            to actually do.  How does one highlight all points less than a given distance <i>R</i> from
            an arbitrary function <i>f(x)</i>?<br>
            <br>
            The naive approach would be to find the nearest point on <i>f(x)</i> to every pixel on the screen,
            and then check if that distance is less or equal to <i>R</i>.  If so, highlight the 
            pixel, if not, don't.  The issue with this is that finding the nearest point to another on an arbitrary
            function isn't particularly easy.  Newton's method is nice, but doesn't always converge.<br>
            <br>
            My approach instead involves defining and integrating a special function <i>D(x,y,t)</i>
            with respect to <i>t</i>.  This function is relatively simple: <i>x</i> and <i>y</i> are the
            coordinates of any point on the screen, and <i>t</i> defines another point placed at <i>x=t</i>
            on the arbitrary function <i>f(x)</i> we were given.  It then uses a simple piecewise expression
            to return 1 if the points are closer than <i>R</i> and 0 if they are not.<br>
            <br>
            What's the result of integrating this bad boy?  Since an integral is really an just an infinite sum, which
            is effectively an infinite for loop, we can use it to evaluate if ANY of the infinite number of points on <i>f(x)</i>
            come within <i>R</i> units of each pixel.  In a world where Desmos could evaluate the integral perfectly,
            it would highlight any points for which <i>D(x,y,t)</i> is 1 at some <i>t</i>.<br>
            <br>
            But unfortunately, it doesn't, since integration is also a hard problem.<br>
            You're better off using a signed distance function if one exists!
        </section>
    </section>
</div>
