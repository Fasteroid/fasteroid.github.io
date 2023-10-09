import { load as loadParent } from "../+layout";
import { defineData } from "$lib/datacomposer";

export const load = defineData( loadParent, {
	title: "E2 Stuff",
	longTitle: "Expression 2"
} )