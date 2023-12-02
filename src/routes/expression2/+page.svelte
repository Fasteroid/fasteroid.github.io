<script>
  import { base } from "$app/paths";
    import ProjectCollection from "../../components/projectcollection/ProjectCollection.svelte";
</script>

<svelte:head>
    <style lang="scss">
        @import "./e2-project.scss";
    </style>
</svelte:head>

<ProjectCollection topic="expression2">
    <a href="https://github.com/Fasteroid/expression2-public">
        <img src="{base}/assets/expression2/github.png" alt="thumbnail">
        <div class="project-title">Public E2 Repository</div>
    </a>
</ProjectCollection>