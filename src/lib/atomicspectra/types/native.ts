export type SpectraLine = {
    wl: number,
    a:  number,
}

export type Element = {

    name:          string,
    symbol:        string,
    atomic_number: number,
    atomic_mass:   number,

    category:      Category,

    table_x:       number,
    table_y:       number,

    spectra:       SpectraLine[],

}

export type Category = 'alkali-metal' | 'alkaline-metal' | 'transition-metal' | 'metalloid' | 'post-transition-metal' | 'nonmetal' | 'noble-gas' | 'lanthanide' | 'actinide' | 'synthetic'

export type PTable = {
    elements: Element[]
}