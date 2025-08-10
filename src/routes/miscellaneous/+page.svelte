<script>
    import { base } from "$app/paths";
    import ProjectShelf from "../../components/project-shelf/ProjectShelf.svelte";
    import BackgroundTitle from "../../components/titlebar/BackgroundTitle.svelte";
</script>

<svelte:head>
    <style lang="scss">
        @import "./webdev-project.scss";
    </style>
</svelte:head>

<section class="root">
    <BackgroundTitle background="{base}/assets/miscellaneous/banner.jpg">
        <div>Miscellaneous Stuff</div>
        <div class="subhead">Who knows what you'll find here?</div>
    </BackgroundTitle>
    <ProjectShelf directory="miscellaneous"/>
</section>
