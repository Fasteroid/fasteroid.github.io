import adapter from '@sveltejs/adapter-static';
import preprocess from 'svelte-preprocess';

/** @type {import('svelte/compiler').PreprocessorGroup[]} */
const preprocessors = [
	
	/* doublespace.js */ {
		markup({content, filename}) {
			if( filename?.match(/\/routes\/.*?\+.*?\.svelte/) && content.match(/<section>/) ){
				content = content.replaceAll('.  ','.&nbsp; ');
				content = content.replaceAll('!  ','!&nbsp; ');
				content = content.replaceAll('?  ','?&nbsp; ');
				content = content.replaceAll('—','<span class="emdash">—</span>');
				return { code: content }
			}
		}
	},

	/* svelte-preprocess */
	preprocess({
		scss: {
			includePaths: ["src/globalstyle"]
		}
	})
	
]

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: preprocessors,
	compilerOptions : {
		hydratable: false
	},
	kit: {
		adapter: adapter({
			pages:  'build',
			assets: 'build',
			fallback: undefined,
			precompress: false,
			strict: true
		}),
		paths: {
			base: "/svelte-portfolio"
		}
	},
};

export default config;
