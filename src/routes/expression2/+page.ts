import { load as loadParent } from "../+layout";
import { defineData } from "$lib/datacomposer";

export const load = defineData( loadParent, {
	title: "Expression 2"
} )