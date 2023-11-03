/*
    Since using the actual base from the "paths" property in svelte.config 
    breaks Github Pages, we are forced to do this horribleness.
*/
export const base = process.env.NODE_ENV?.includes("dev") ? "" : "/svelte-portfolio"