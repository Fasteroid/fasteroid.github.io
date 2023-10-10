import { load as loadParent } from "../+page";
import { defineData } from "$lib/pagedata"

export const load = defineData( loadParent, {
	title: "Galton Board",
	thumbnail: "galtonboard.png"
} )