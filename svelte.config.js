import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter(),
		paths: {
		  base: process.env.NODE_ENV === "production" ? "/svelte-portfolio" : "",
		},
	},
};

export default config;
