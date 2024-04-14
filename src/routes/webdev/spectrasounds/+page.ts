import { load as loadParent } from "../+page";
import { defineData } from "$lib/pagedata"

export const load = defineData( loadParent, {
	title: "Atomic Spectra Sounds",
	thumbnail: "spectrasounds.png"
} )