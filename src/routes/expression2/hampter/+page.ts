import { load as loadParent } from "../+page";
import { defineData } from "$lib/pagedata"

export const load = defineData( loadParent, {
	title: "Wrecking Ball",
	thumbnail: "hampter.png"
} )