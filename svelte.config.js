import adapter from '@sveltejs/adapter-static';
import preprocess from 'svelte-preprocess';

/* 
	This custom preprocessor replaces doublespace.js from the old site.
	It pretty much does the same thing, but now it doesn't burden the client!
*/
let customSpacing = {
	markup({content, filename}) {
		if( filename.match(/\/routes\/.*?\+.*?\.svelte/) && content.match(/<body>/) ){
			content = content.replaceAll('.  ',' &nbsp;');
			content = content.replaceAll('!  ',' &nbsp;');
			content = content.replaceAll('?  ',' &nbsp;');
			content = content.replaceAll('—','<span class="emdash">—</span>');
			return { code: content }
		}
	},
}

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [
		customSpacing,
		preprocess(),
	],
	kit: {
		adapter: adapter(),
		paths: {
			base: process.env.NODE_ENV === "production" ? "/svelte-portfolio" : "/test",
		}
	},
};

export default config;
