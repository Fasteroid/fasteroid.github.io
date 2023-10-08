
import * as fs from 'fs'
import { base } from "$app/paths";
import type { PageData } from '../routes/$types';

type PageOptions = {
    load: (() => PageData)
}

class LoaderPathable {
    private _path:  string;

    constructor(path: string){
        this._path = path;
    }

    public get webPath(): string {
        return base + this._path
    }
    public get dirPath(): string {
        return "src/routes" + this._path;      
    }
    public get rawPath(): string {
        return this._path;
    }
    public get importPath(): string {
        if(process.env.NODE_ENV == "production") // thanks vite
            return "../entries/pages" + this._path.replace(/(\+)(.*?)(\.ts)$/gm,"_$2.ts.js");
        else 
            return "../routes" + this._path.replace(/\.[^\.]*?$/gm,"");
    }
}

class LoaderTreeNode extends LoaderPathable {
    
    private _children?:  {[key: string]: LoaderTreeNode}
    key:        string;
    pageData!:  FullPageData;

    constructor(path: string, key: string){
        super(path)
        this.key = key;
    }

    getChild(key: string): LoaderTreeNode {
        if( !this._children ) this._children = {};
        if( !this._children[key] ) this._children[key] = new LoaderTreeNode(`${this.rawPath}/${key}`, key)
        return this._children[key];
    }

    getChildren(): LoaderTreeNode[] {
        return Object.values( this._children || {} )
    }

    getChildrenAtPath(path: string): LoaderTreeNode[] {
        let chain: string[] = path.split("/").slice(1)
        let destination: LoaderTreeNode = this;
        for( let link of chain ){
            if( link.length < 1 ){ throw "bad getPathChildren; malformed." }
            if( !destination._children ){ throw `bad getPathChildren; ${destination.dirPath} has no children.` }
            if( !destination._children[link] ){ throw `bad getPathChildren; ${destination.dirPath} does not have ${link}.` }
            destination = destination._children[link];
        }
        return destination.getChildren()
    }
}

type LoaderFileHandler = (file: fs.Dirent, node: LoaderTreeNode) => Promise<void>
const fileHandlers: {[key: string]: LoaderFileHandler | undefined} = {

    ["+page.ts"]: async (file, node) => {
        const importPath = new LoaderPathable(`${node.rawPath}/${file.name}`).importPath
        let options: PageOptions;
        try {
            options = await import( /* @vite-ignore */ importPath );
        }
        catch(e){
            throw "bad auto-import: " + importPath + "\n\n" + e
        }
        const data: PageData = options.load();
        node.pageData = data;
    }

}

async function collectPageData(node: LoaderTreeNode){
    const dirents = fs.readdirSync(
        node.dirPath, 
        {withFileTypes: true}
    );
    for( const ent of dirents ){
        if( ent.isFile() ){
            let handler = fileHandlers[ent.name];
            if( handler ) await handler(ent, node);
        }
        else if( ent.isDirectory() ){
            await collectPageData( node.getChild(ent.name) )
        }
    }
    return node;
}

const pagetree = await collectPageData( new LoaderTreeNode("","") )
export { pagetree };
