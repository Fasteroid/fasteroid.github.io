import { load as loadParent } from "../+page";
import { defineData } from "$lib/pagedata"

export const load = defineData( loadParent, {
	title: "VR Holo Designer",
	thumbnail: "vrholos.png"
} )