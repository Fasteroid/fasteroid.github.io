// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
    namespace App {
        interface PageData extends FullPageData {}
    }
}

interface PartialPageData {
    title:	    string;
    longTitle?: string;
    thumbnail?: string;
}

interface FullPageData extends PartialPageData {
    titlePath: string[];
}