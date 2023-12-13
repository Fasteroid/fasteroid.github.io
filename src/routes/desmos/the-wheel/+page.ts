import { load as loadParent } from "../+page";
import { defineData } from "$lib/pagedata"

export const load = defineData( loadParent, {
	title: "The Wheel",
	thumbnail: "wheelthumbnail.png",
	longTitle: "(3D) The Wheel"
} )