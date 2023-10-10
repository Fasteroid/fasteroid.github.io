import { load as loadParent } from "../+layout";
import { defineData } from "$lib/pagedata"

export const load = defineData( loadParent, {
	title: "About"
})