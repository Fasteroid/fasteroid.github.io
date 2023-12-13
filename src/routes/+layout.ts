import type { FullPageData } from "$lib/pagedata";

export const prerender = true;
export const ssr = true;
// export const csr = false; // I hate everything

let title = "Fast's Code Creations"

export function load(): FullPageData {
	return {
        titlePath: [title],
		title:     title
	};
}