
import * as fs from 'fs'
import { base } from "$app/paths";


const routesPath = "src/routes";


type SveltePage = {

}

const titleExtractor = /<\s*?title\s*?>(.*?)<\s*\/title\s*>/gm

function gatherPages(path: string){

    const dirents = fs.readdirSync(path, {withFileTypes: true});

    for( const ent of dirents ){
        if( ent.isFile() && ent.name == "+page.svelte" ){
            console.log(ent.name, path)
        }
        else if( ent.isDirectory() ){
            gatherPages(`${path}/${ent.name}`)
        }
    }

}

gatherPages(routesPath)

export let directory = {};
