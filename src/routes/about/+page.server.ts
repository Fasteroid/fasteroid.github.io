import { load as loadParent } from "../+layout.server";
import { defineData } from "$lib/datacomposer";

export const load = defineData( loadParent, {
	title: "About"
})