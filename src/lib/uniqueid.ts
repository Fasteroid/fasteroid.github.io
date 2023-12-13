// this is used because I don't need the full hydration capabilities of svelte; they just slow my site down.

import { browser } from "$app/environment";

const INIT_STATE: number = 0

export type IntStr         = `${bigint}`
export type PrefixedIntStr = `${string}_${IntStr}`


export class UniqueIDs {

	private static state: number[] = [];

	private static generate(bucket: number): number {
		let n = (this.state[bucket] || 0) + 1;
		this.state[bucket] = n;
		return n;
	}

	private static pad(num: number, digits: number): string {
		const numStr = num.toString()
		return `${'0'.repeat(digits - numStr.length)}${numStr}`
	}

	private static next(bucket: number): IntStr {
		return this.pad( this.generate(bucket), 5 ) as IntStr;
	}

	private static get(prefix: string, client: boolean): PrefixedIntStr {
		const id = this.next(client ? 0 : 1);
		return `${prefix}_${id}`
	}

	static getClient(prefix: string){
		return this.get(prefix, true)
	}

	static getServer(prefix: string){
		return this.get(prefix, false)
	}

	static start(){
		this.state = [];
	}

}

export function assertExists(id: string): HTMLElement {
	const elem = document.getElementById( id )
    if(!elem){ console.error(`assertExists failed: ${id} does not exist`); throw "failure" }
    return elem;
}

export function assertQueryExists(parent: HTMLElement, query: string): HTMLElement {
	const elem = parent.querySelector(query) as HTMLElement
    if(!elem){ console.error(`assertQueryExists failed: ${query} does not exist on`, parent); throw "failure" }
    return elem;
}