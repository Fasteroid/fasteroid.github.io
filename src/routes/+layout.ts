export const prerender = true;

let title = "Fast's Code Creations"

export function load() {
	return {
        titlePath: [title],
		title:     title
	};
}

