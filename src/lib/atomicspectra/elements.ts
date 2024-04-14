import { get } from './get'
import { load } from "cheerio";
import fs from 'fs';
import { SpectraAtoms, SpectraLine, ELEMENT_NAMES } from './types';

async function main(){
    
    // const data = await get(`https://www.physics.nist.gov/PhysRefData/Handbook/Tables/${TEST_ELEMENT}table2.htm`);

    let atoms: SpectraAtoms = {};

    let promises: Promise<void>[] = [];

    for( let i = 0; i < ELEMENT_NAMES.length; i++ ){
        const name = ELEMENT_NAMES[i];
        const data = get(`https://www.physics.nist.gov/PhysRefData/Handbook/Tables/${name}table2.htm`);

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

            atoms[i+1] = lines;
        } ) );
    }

    Promise.all(promises).then( () => {
        fs.writeFileSync('spectra.json', JSON.stringify(atoms));
    } )

}

main();


