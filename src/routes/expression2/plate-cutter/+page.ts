import { load as loadParent } from "../+page";
import { defineData } from "$lib/pagedata"

export const load = defineData( loadParent, {
	title: "Plate Cutter",
	thumbnail: "platecutter.png"
} )