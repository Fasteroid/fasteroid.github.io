import { load as loadParent } from "../+page";
import { defineData } from "$lib/pagedata"

export const load = defineData( loadParent, {
	title: "Metal Pipe",
	thumbnail: "metalpipe.png",
	longTitle: "(3D) Falling Metal Pipe",
} )