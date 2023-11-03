
import * as fs from 'fs'
import { TreeNode } from './treelib';
import type { FullPageData } from './pagedata';
import { base } from "$app/paths";

TreeNode.setWebBase(base)

type PageOptions = { load: (() => FullPageData) }
type TreeFileHandler = (file: fs.Dirent, node: TreeNode) => Promise<void>

function toDir(p: string): string {
    return `./src${p}`
}

function toModule(p: string): string {
    return `./../entries/src${p}`.replace(".ts",".js")
}

const fileHandlers: {[key: string]: TreeFileHandler | undefined} = {

    ["+page.ts"]: async (file, node) => {
        const importPath = toModule(`${node.path}/${file.name}`)
        let options: PageOptions;
        try {
            console.log(importPath)
            options = await import(importPath);
        }
        catch(e){
            console.warn("bad auto-import: " + importPath + "\n" + e + "\n\n")
            return;
        }
        const data: FullPageData = options.load();
        node.pageData = data;
    }

}

async function buildPageTree(node: TreeNode = new TreeNode("","")){
    const dirents = fs.readdirSync(
        toDir(node.path), 
        {withFileTypes: true}
    );
    for( const ent of dirents ){
        if( ent.isFile() ){
            let handler = fileHandlers[ent.name];
            if( handler ) await handler(ent, node);
        }
        else if( ent.isDirectory() ){
            await buildPageTree( node.getChild(ent.name) )
        }
    }
    return node;
}

let start = performance.now()
export const pagetree = await buildPageTree( new TreeNode("/routes","") );
const output = JSON.stringify(pagetree,undefined,4)
fs.writeFileSync("./src/lib/pagetree.json", output)

console.log(`  treebuilder.ts: Created pagetree.json in ${Math.floor(performance.now() - start)} ms`)
