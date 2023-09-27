import adapter from '@sveltejs/adapter-static';
import preprocess from 'svelte-preprocess';

/* 
	This custom preprocessor replaces doublespace.js from the old site.
	It pretty much does the same thing, but now it doesn't burden the client!
*/
let customSpacing = {
	markup({content, filename}) {
		if( filename.match(/\/routes\/.*?\+.*?\.svelte/) && content.match(/<body>/) ){
			content = content.replaceAll(/ {3,}/gm,"")                       // 3+ spaces in a row is indentation, remove it
			content = content.replaceAll(/\r?\n/gm,'');                      // remove line breaks regardless of operating system
			content = content.replaceAll('—','<div class="emdash">—</div>'); // give em dashes extra wideness for this font
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
			base: process.env.NODE_ENV === "production" ? "/svelte-portfolio" : "",
		}
	},
};

export default config;
