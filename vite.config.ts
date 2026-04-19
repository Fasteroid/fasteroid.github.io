import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	build: {
		target: "esnext",
		minify: false,
	},
	esbuild: {
		supported: {
			'top-level-await': true
		},
	},
	css: {
		preprocessorOptions: {
			sass: {
				silenceDeprecations: ['import', 'slash-div', 'global-builtin'], // list of warnings to hide
				quietDeps: true,
			},
			scss: {
				silenceDeprecations: ['import', 'slash-div', 'global-builtin'],
				quietDeps: true,
			},
		},
		
	},
	plugins: [sveltekit()]
});
