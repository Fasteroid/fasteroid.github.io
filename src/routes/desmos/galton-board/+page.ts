import { load as loadParent } from "../+page";
import { defineData } from "$lib/datacomposer";

export const load = defineData( loadParent, {
	title: "Galton Board",
	thumbnail: "galtonboard.png"
} )