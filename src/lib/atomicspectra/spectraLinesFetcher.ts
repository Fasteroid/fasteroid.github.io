import { unsafeGet } from './unsafeGet'
import { load } from "cheerio";
import { SpectraLine } from './types/native';

const ELEMENT_NAMES = [
    'hydrogen', 'helium', 'lithium', 'beryllium', 'boron', 'carbon', 'nitrogen', 'oxygen', 
    'fluorine', 'neon', 'sodium', 'magnesium', 'aluminum', 'silicon', 'phosphorus', 'sulfur', 
    'chlorine', 'argon', 'potassium', 'calcium', 'scandium', 'titanium', 'vanadium', 'chromium', 
    'manganese', 'iron', 'cobalt', 'nickel', 'copper', 'zinc', 'gallium', 'germanium', 
    'arsenic', 'selenium', 'bromine', 'krypton', 'rubidium', 'strontium', 'yttrium', 'zirconium', 
    'niobium', 'molybdenum', 'technetium', 'ruthenium', 'rhodium', 'palladium', 'silver', 'cadmium', 
    'indium', 'tin', 'antimony', 'tellurium', 'iodine', 'xenon', 'cesium', 'barium', 
    'lanthanum', 'cerium', 'praseodymium', 'neodymium', 'promethium', 'samarium', 'europium', 'gadolinium', 
    'terbium', 'dysprosium', 'holmium', 'erbium', 'thulium', 'ytterbium', 'lutetium', 'hafnium', 
    'tantalum', 'tungsten', 'rhenium', 'osmium', 'iridium', 'platinum', 'gold', 'mercury', 
    'thallium', 'lead', 'bismuth', 'polonium', 'astatine', 'radon', 'francium', 'radium', 
    'actinium', 'thorium', 'protactinium', 'uranium', 'neptunium', 'plutonium', 'americium', 'curium', 
    'berkelium', 'californium', 'einsteinium'
]

export async function getSpectraLines(){

    return new Promise<SpectraLine[][]>( (resolve, reject) => {

        const promises:     Promise<void>[] = [];
        const spectraLines: SpectraLine[][] = [];

        for( let i = 0; i < ELEMENT_NAMES.length; i++ ){
            const name = ELEMENT_NAMES[i];
            const data = unsafeGet(`https://www.physics.nist.gov/PhysRefData/Handbook/Tables/${name}table2.htm`);

            promises.push( data.then( (data) => { 
                const lines: SpectraLine[] = [];

                const $ = load(data);
        
                const vacuumSpectraTable     = $('table').eq(2);
                const vacuumSpectraTableRows = vacuumSpectraTable.find('tr').slice(3);

                for (let i = 0; i < vacuumSpectraTableRows.length; i++){
                    const row = vacuumSpectraTableRows.eq(i);
                    const columns = row.find('td');
            
                    const a   = parseFloat(columns.eq(0).text());
                    const wl  = parseFloat(columns.eq(1).text());
            
                    lines.push({ wl, a });
                }

                spectraLines[i] = lines;
            } ) );
        }

        Promise.all(promises).then( () => {
            resolve(spectraLines)
        } )
    } );

}


