import { getSpectraLines } from "./spectraLinesFetcher";
import { External } from "./types/external";
import { Category, Element, PTable } from "./types/native";
import { unsafeGet } from "./unsafeGet";
import * as fs from 'fs';

// 'alkali metal': 'Alkali',
// 'alkaline earth metal': 'AlkalineEarth',
// 'transition metal': 'Transition',
// 'metalloid': 'Metalloid',
// 'post-transition metal': 'PostMetal',
// 'polyatomic nonmetal': 'Nonmetal',
// 'diatomic nonmetal': 'Nonmetal',
// 'noble gas': 'NobleGas',
// 'lanthanide': 'Lanthanide',
// 'actinide': 'Actinide',
// 'unknown': 'Synthetic',

const CATEGORY_MAP: {[cat: string]: Category} = {
    'alkali metal':          'alkali-metal',
    'alkaline earth metal':  'alkaline-metal',
    'transition metal':      'transition-metal',
    'metalloid':             'metalloid',
    'post-transition metal': 'post-transition-metal',
    'polyatomic nonmetal':   'nonmetal',
    'diatomic nonmetal':     'nonmetal',
    'noble gas':             'noble-gas',
    'lanthanide':            'lanthanide',
    'actinide':              'actinide',
}

function toCategory( category: string ): Category {
    return CATEGORY_MAP[category] || 'synthetic';
}

async function main() {
    
    const data = await unsafeGet('https://raw.githubusercontent.com/Bowserinator/Periodic-Table-JSON/master/PeriodicTableJSON.json')

    const importedElements = ( JSON.parse(data) as External.PTable ).elements;

    const exportedElements: Element[] = [];
    const spectra = await getSpectraLines();

    for( let element of importedElements ){
        const { name, symbol, number, atomic_mass, category, xpos, ypos } = element;

        const newElement: Element = {
            name,
            symbol,
            atomic_number: number,
            atomic_mass,
            category: toCategory(category),
            table_x: xpos,
            table_y: ypos,
            spectra: spectra[number - 1],
        }

        exportedElements.push(newElement);
    }

    let output_elements = JSON.stringify(exportedElements);
        output_elements = output_elements.replace(/({"name")/g, '\n$1'); // Add newlines before each element
        output_elements = output_elements.replace(/\n/g, "\n  ");        // Indent each element
        output_elements = output_elements.replace(/}]\n}$/, ']\n}\n]');  // push this one bracket to the next line
        output_elements = output_elements.replace(/^/gm, "  ");          // Indent every line

    let output: string = `{\n  "$schema": "./elements.schema.json",\n  "elements":${output_elements}\n}`;

    fs.writeFileSync('./elements.json', output);
    
}

main();