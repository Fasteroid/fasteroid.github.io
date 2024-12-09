import { load as loadParent } from "../+page";
import { defineData } from "$lib/pagedata"

export const load = defineData( loadParent, {
	title: "Music Map",
	longTitle: "Map of Musicians"
})