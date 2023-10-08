import { load as loadParent } from "../+page";
import { defineData } from "$lib/datacomposer";

export const load = defineData( loadParent, {
	title: "Nearby Points",
	thumbnail: "integralabuse.png"
} )