import { load as loadParent } from "../+page";
import { defineData } from "$lib/pagedata"

export const load = defineData( loadParent, {
	title: "F=MA Physics Gun",
	thumbnail: "physgun.png"
} )