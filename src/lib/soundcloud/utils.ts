export class AutoMap<K, V> extends Map<K, V> {
    /**
     * @param computer Instantiates default value for keys that don't exist
     */
    public constructor( private computer: (key: K) => V ){ super(); }

    public override get(key: K): V {
        let value = super.get(key);
        if( value === undefined ){
            value = this.computer(key);
            super.set(key, value);
        }
        return value;
    }
}

/**
 * A caching helper for lookups that are expensive to compute which won't change during the cache's lifetime.
 */
export class LookupCache<Item extends object, Prop> {
    private _map = new WeakMap<Item, Prop>(); // let the contents die if they aren't being used
    
    /**
     * @param computer A function that computes the value for a given item
     */
    constructor(private computer: (it: Item) => Prop) { }

    /**
     * Retrieves the value associated with the item, computing it if it doesn't exist.
     */
    public get(item: Item): Prop {
        let value = this._map.get(item);
        if( value === undefined ){
            value = this.computer(item);
            this._map.set(item, value);
        }
        return value;
    }
}