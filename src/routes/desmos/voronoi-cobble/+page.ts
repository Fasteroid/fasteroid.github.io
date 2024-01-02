import { load as loadParent } from "../+page";
import { defineData } from "$lib/pagedata"

export const load = defineData( loadParent, {
	title: "Voronoi Cobblestone",
	thumbnail: "voronoicobble.png",
	longTitle: "(3D) Voronoi Cobblestone"
} )