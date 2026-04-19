import { AutoMap } from "@fasteroid/maps/AutoMap";




const DebugTicker = new class _DebugTicker {
    private _t = 0;
    public get t() { return this._t; }

    constructor() {
        const channel = new MessageChannel();
        const tick = () => {
            this._t++;
            channel.port2.postMessage(null)
        }

        channel.port1.onmessage = tick;
        tick();
    }
}

export class Debug {

    public static get ticks() { return DebugTicker.t }


    private static IDs = new AutoMap< string, AutoMap<any, number> >(
        () => {
            let id = 0
            return new AutoMap( () => id++ )
        }
    )

    /**
     * @param namespace describe {@linkcode what}
     * @param what subject
     * @rest context
     */
    public static logFancy(namespace: string, what: any, ...args: any[]) {
        console.log(
            `%c${Debug.ticks} %c${namespace}\t%c#${Debug.IDs.get(namespace).get(what)}`, 
            "color: #ff9999", 
            "color: #ff9966",
            "color: #66ccff", 
            ...args
        );
    }

    
}