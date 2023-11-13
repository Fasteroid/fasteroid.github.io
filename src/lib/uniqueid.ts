// this is used because I don't need the full hydration capabilities of svelte; they just slow my site down.

const INIT_STATE: number = 42

export type IntStr         = `${bigint}`
export type PrefixedIntStr = `${string}_${IntStr}`

export class UniqueIDs {

	private static state: number = INIT_STATE;

	private static generate(): number {
		let n = this.state + 1;
		n ^= (n << 13) & 0xFFFF;
		n ^= (n >> 17) & 0xFFFF;
		n ^= (n << 5)  & 0xFFFF;   
		this.state = n;
		return n;
	}

	private static pad(num: number, digits: number): string {
		const numStr = num.toString()
		return `${numStr}${'0'.repeat(digits - numStr.length)}`
	}

	/**
	 * @returns pseudorandom, consistent, non-repeating id between 00001-65535
	 */
	static next(): IntStr {
		return this.pad( this.generate(), 5 ) as IntStr;
	}

	/**
	 * @returns Same as {@link UniqueIDs.next} but prefixes the returned value with the provided string
	 */
	static prefix(prefix: string): PrefixedIntStr {
		return `${prefix}_${this.next()}`
	}

	static start(){
		this.state = INIT_STATE;
	}

}

export function assertExists(elem: HTMLElement | null): HTMLElement {
    if(!elem){ throw `assertExists failed...`}
    return elem;
}