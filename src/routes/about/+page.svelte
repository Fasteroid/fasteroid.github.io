<script lang="ts">
    import { base } from "$app/paths";
</script>

<style lang="scss">

    .term {
        display: inline-block;
        anchor-scope: --term;

        span {
            anchor-name: --term;
            display: inline-block;
            font-style: italic;
            cursor: help;
        }

        .desc {

            position: fixed;            
            width: max-content;
            max-width: max-content;
            padding: 3px 6px;
            box-sizing: border-box;

            text-decoration: none;
            font-style: normal;
            font-size: small;

            background-color: rgba(0, 0, 0, 0.418);
            backdrop-filter: blur(3px);

            position-anchor: --term;
            position-area: center;
            justify-self: start;
            transform: translateY(90%);

            opacity: 0;
            pointer-events: none;

            z-index: 2;

            transition: opacity 1s ease;
        }

        .desc::before {
            content: '💡';
            display: inline-block;
            padding-right: 5px;
        }
    }

    .term:hover {
        text-decoration: underline;

        .desc {
            opacity: 1;
            pointer-events: all;
        }
    }

    .deadlink {
        color: #da7878; 
        cursor: pointer; 
        text-decoration: underline;
    }

</style>

<body>
    <div class="margins">
        <section>
            <hgroup class="taller">
                <h1>About Me</h1>
            </hgroup>
            <div class="p">
                <img src="{base}/assets/aboutme/fasteroidbruh.jpg" style="float:left; max-height: 245px; margin-left: 0px;" 
                alt="A 3D-printed replica Expression 2 chip from Garry's Mod.">
                Hi, I'm Fasteroid!  Nice to meet you!<br>
                <br>
                I'm a Computer Science graduate from <a href="https://www.wilmu.edu/">Wilmington University</a> (plus some others, it's complicated).  
                I work for a small software company that collaborates and ships most of its software for a local manufacturing company.  Might sound 
                boring to some, but honestly it's pretty peak to me.  A small company means no corporate bureacracy, manufacturing means I'm around
                people who do engineering (which I also love), and I don't have a third thing to say because I didn't use AI to write this crap!<br>
                <div style="font-size: smaller;">
                    <br>
                    (Shame on you for thinking that seeing rule of three or em-dashes in a piece of text automatically means AI wrote it—the reason it writes
                    like that is because WE write like that!)
                    <br>
                    <br>
                </div>
                I began writing my first original lines of code early to mid 2014, in a niche language unique to 
                <div class='term'>
                    <span>Garry's Mod</span>
                    <div class='desc'>A physics sandbox game built on Half-Life 2's game engine, <i>Source</i></div>
                </div> 
                called Expression&nbsp;2.  It had a very steep learning curve to it at first due to its obscurity and 
                narrow scope of applications, but by 2015 (once I had begun to understand basic syntax), it had ignited a god complex within me.  
                I don't claim to know everything, but I'm <i>most certainly</i> better than average.  Experience is shown in practice, not told by
                a fancy piece of paper or a previous boss.
                <div style="clear:both"></div>
            </div>
            <div class="p">
                <img src="{base}/assets/aboutme/ody.jpg" style="float:right; max-height: 245px; margin-right: 0px;"
                alt="2018 claiming of the prestigious Ranatra Fusca Creativity Award at DE State Finals.">
                My most memorable adventures happened in my highschool era, thanks to <a href="https://odysseyofthemind.com">Odyssey of the Mind</a>,
                which is a collaborative problem-solving extracurricular for creative thinkers.  
                Each year, teams of 5-7 choose one of five long-term problems (which all involve some combination of goofy skits and engineering),
                and upon performance day must tackle the secret 'spontaneous' problem with nothing but their wits and what's provided.<br>
                <br>
                With my dad as team coach (who's only there to keep us on-task and safe–<div class='term'>
                    <div class='desc'>The team must develop all ideas and props on their own.</div>
                    <span>outside assistance</span>
                </div> 
                is forbidden), and some crazy ideas from my teammates,
                we reached the prestigious World Finals competition four times in a row, 2016 to 2019, with a second place
                victory in Problem 2 Division III the final year.  I'd link you the 
                <a class='deadlink', href="https://www.odysseyofthemind.com/wf2019/world-finals-2019-scores">scores here</a>, 
                but they've unfortunately been lost to time :^)<br>
                <br>
                Odyssey of the Mind taught me a lot—mainly that it usually isn't feasable for one person to work on everything.  
                Different people have different strengths and weaknesses, and if one person does everything, they're bound to hit 
                a weakness eventually.  In contrast, with good teamwork and good skill coverage, due to the
                <div class='term'>
                    <div class='desc'>An individual slice may have holes, but with enough stacked it can appear as if there aren't any.</div>
                    <span>swiss cheese model</span>
                </div>, it is almost impossible to
                pick a challenge that truly defeats everyone on the team.  I still try to keep in touch with them, but as adults that have 
                scattered across the country, it's nearly impossible.<br>
                <div style="clear:both"></div>
            </div>
            <div class="p">
                <img src="{base}/assets/aboutme/gmodfriends.jpg" style="float:left; max-height: 245px; margin-left: 0px;" 
                alt="Friends on E2 Beyond Infinity.">
                My other fondest memories are from my two Garry's Mod servers, <i>E2 Beyond Infinity</i> and <i>Props Beyond Infinity</i>.  
                One is a programming and scripting paradise with the occasional player or two, and the other is a prop hunt server that
                has yet to see itself at max players.<br>
                <br>
                One of the coolest features of both these servers is the presence of a bidirectional Discord Relay I designed, which allows seamless two-way 
                interaction between players on the Garry's Mod server and users in its Discord server.  This relay has proved to serve
                many practical applications, ranging from posting memes in the in-game chat to running commands remotely from up to 8,000 miles away.  
                It's not a unique idea by any means (plenty have done it), but I'm still proud of it because I built it mostly from scratch!<br>
                <br>
                In 2021 or 2022 (I forget exactly when), I had acquired enough money via server donations to purchase a new dedicated machine for the server.  
                This machine runs Linux instead of Windows, and was designed with ridiculous single-core performance in mind.  As a result, Expression 2 scripts
                run with about half the cpu time they used to on the old i7 in the previous machine. The server also tolerates the other crap we put it through
                a lot better now, such as spawning hundreds of physics entities in confined spaces.  
                It's mostly dead now, but it still occasionally sees new players, and I still do hang out on it with friends from time to time.  It also barely
                costs anything to run, so I don't plan on closing it any time soon.<br>
                <br>
                <div style="clear:both"></div>
                That's the end of my TL;DR.<br>
                If I've piqued your interest at all, you should check out my <a href="./about/skilltree">technical skill tree</a> and learn more about what I can do.  
                Perhaps I can be of use to you!<br>
            </div>
            —Fast<br>
        </section>
    </div>
</body>

