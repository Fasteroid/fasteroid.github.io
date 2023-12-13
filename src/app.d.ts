// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

import { FullPageData } from "$lib/pagedata"

declare global {
    namespace App {
        interface PageData extends FullPageData {}
    }
}