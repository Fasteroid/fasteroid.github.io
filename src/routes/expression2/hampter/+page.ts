import { load as loadParent } from "../+page";
import { defineData } from "$lib/pagedata"

export const load = defineData( loadParent, {
	title: "Wrecking Ball",
	longTitle: "[OW2] Wrecking Ball",
	thumbnail: "hampter.png"
} )