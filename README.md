# Welcome!

My name is Fasteroid, and you've just discovered the source code to my portfolio website!<br>

## Building

This site is built with SvelteKit and Vite. &nbsp;To build, run this:
```bash
npm run build
```

If you want to just run the prebuild scripts without doing a full build, this command is for you:
```bash
npm run prebuild
```
These do things like [automatically mapping the site](https://github.com/Fasteroid/fasteroid.github.io/blob/new/src/building/treebuilder.ts) so I don't have to manually manage what's in the navbar.

## Developing
Most of the time all you'll need to do is run this:
```bash
npm run dev
```
Sometimes you'll also have to run the prebuild scripts for a change to show up.

## Deploying
Provided you have the Github Pages environment on and github actions enabled, pushing to ~~main~~ *new* will automatically trigger a re-deployment. &nbsp;To avoid unnecessary deployments, you should consider committing to any other branch until you're ready to push a new feature.

Special thanks to [@Penca53](https://github.com/Penca53) for figuring out how to deploy SvelteKit to Github Pages.
