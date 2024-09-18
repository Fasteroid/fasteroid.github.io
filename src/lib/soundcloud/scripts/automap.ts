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