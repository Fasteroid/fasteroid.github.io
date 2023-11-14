import { load as loadParent } from "../+page";
import { defineData } from "$lib/pagedata"

export const load = defineData( loadParent, {
	title: "(3D) The Wheel",
	thumbnail: "wheelthumbnail.png"
} )