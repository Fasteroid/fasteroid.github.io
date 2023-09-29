<script lang="ts">
  import { base } from "$app/paths";
</script>

<svelte:head>
  <title>About Me</title>
</svelte:head>

<!-- Later: <component class="navbar" src="navbar.html"></component> -->

<body>
    <div class="margins">
        <section>
            <h1>
                <b>About Me</b>
            </h1>
            <div class="p">
                <img src="{base}/assets/aboutme/fasteroidbruh.jpg" style="float:left; max-height: 245px; margin-left: 0px;" 
                alt="A 3D-printed replica Expression 2 chip from Garry's Mod.">
                Hi, I'm Fasteroid!  Nice to meet you!<br>
                <br>
                I'm a recent Computer Science graduate from <a href="https://www.wilmu.edu/">Wilmington University</a>.  
                I'm currently looking work as a programmer, developer, or designer of computer related doohickeys.  I'm also
                looking for a special someone who will tolerate loving the socially-awkward goofball I am.  I spoil you, you spoil me, ya know?<br>
                <br>
                I began writing my first original lines of code early to mid 2014, in a little-known language
                called Expression 2 from the popular sandbox game <i>Garry's Mod</i>.  Expression had a very steep learning 
                curve to it at first due to its obscurity and narrow scope of applications, but by 2015 it had turned
                into a massive power trip for me.  I'm still addicted today.<br>
                <div style="clear:both"></div>
                <br>
                Having now completed college, I can confidently say it's a pyramid scheme.  You pay lots of money for several years
                to take classes that either don't teach you anything or don't teach you the right things, all just to obtain a piece
                of paper that claims you know what you're doing.  For my field, Computer Science, claiming that in general is like
                claiming to know every fish in the ocean on a first-name basis.  Boo!
                <br>
            </div>
            <div class="p">
                <img src="{base}/assets/aboutme/ody.jpg" style="float:right; max-height: 245px; margin-right: 0px;"
                alt="2018 claiming of the Renatra Fusca Creativity Award at DE State Finals.">
                On a lighter note, I still have my achievements in Odyssey of the Mind going for me, which is a 
                collaborative problem-solving extracurricular for creative thinkers.  Each year, teams of 5-7 choose
                one of five long-term problems (which all involve some combination of acting and engineering),
                and are assigned an 8-minute 'spontaneous' problem the day of the performance.<br>
                <br>
                With the help of my father as the team coach (who's just there to organize and keep us on track),
                and my wonderful teammates,
                we managed to be World Finalists four times in a row from 2016 to 2019, with a second place 
                victory for Problem 2 Division III in 2019 (<a href="https://www.odysseyofthemind.com/wf2019/world-finals-2019-scores">scores here</a>).<br>
                <br>
                Odyssey of the Mind taught me a lot—mainly that it usually isn't feasable for one person to work on everything.  
                Different people have different strengths and weaknesses, and if one person does everything, they're bound to hit
                a weakness eventually.  In contrast, with good teamwork and good skill coverage, even an intelligent adversary
                will struggle to pick something that truly defeats everyone on the team.<br>
                <div style="clear:both"></div>
                <br>
            </div>
            <div class="p">
                <img src="{base}/assets/aboutme/gmodfriends.jpg" style="float:left; max-height: 245px; margin-left: 0px;" 
                alt="Friends on E2 Beyond Infinity.">
                I currently spend my days managing my two Garry's Mod servers, <i>E2 Beyond Infinity</i> and <i>Props Beyond Infinity</i>.  
                One is a programming and scripting paradise with a small but devoted playerbase, and the other is a prop hunt server that
                has yet to see itself full.<br>
                <br>
                One of the coolest features of both these servers is the presence of a bidirectional Discord Relay I designed, which allows seamless two-way 
                interaction between players on the Garry's Mod server and users in its Discord server.  This relay has proved to serve
                many practical applications, ranging from posting memes in the in-game chat to running commands remotely from up to 8,000 miles away.    
                It's not a unique idea by any means, but it's 100% my unique implementation.  It's old, but I'm still proud of it.<br>
                <br>
                In 2021 or 2022 (I forget exactly when), I had acquired enough money via server donations to purchase a new dedicated machine for the server.  
                This machine runs Linux instead of Windows, and server performance has been significantly better ever since this change.  Most E2 scripts 
                (which run serverside) run with half the CPU time they used to use.
                The server also tolerates the other crap we put it through a lot better now, such as spawning hundreds of physics entities in confined spaces.  
                Some people say my server is dead, but I'm four years in and still occasionally get new players.  I think it's been a success.
                <div style="clear:both"></div>
                <br>
                That's the end of my TL;DR.<br>
                If I've piqued your interest at all, you should check out my <a href="https://fasteroid.github.io/skilltree.html">technical skill tree</a> and learn more about what I can do.  
                Perhaps I can be of use to you!<br>
            </div>
            —Fast<br>
            <br>
            PS: SVELTE! SVELTE! SVELTE!
        </section>
    </div>
</body>