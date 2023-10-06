
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
        return "../routes/" + this._path.replace(/\.[^\.]*?$/gm,"")
    }
}

class LoaderTreeNode extends LoaderPathable {
    children?:  {[key: string]: LoaderTreeNode}
    key:        string;
    pageData?:  FullPageData;

    constructor(path: string, key: string){
        super(path)
        this.key = key;
    }

    getChild(key: string): LoaderTreeNode {
        if( !this.children ) this.children = {};
        if( !this.children[key] ) this.children[key] = new LoaderTreeNode(`${this.rawPath}/${key}`, key)
        return this.children[key];
    }

    getPathChildren(path: string): LoaderTreeNode[] {
        let chain: string[] = path.split("/").slice(1)
        let destination: LoaderTreeNode = this;
        for( let link of chain ){
            if( link.length < 1 ){ throw "bad getPathChildren; malformed." }
            if( !destination.children ){ throw `bad getPathChildren; ${destination.dirPath} has no children.` }
            if( !destination.children[link] ){ throw `bad getPathChildren; ${destination.dirPath} does not have ${link}.` }
            destination = destination.children[link];
        }
        if( !destination.children ){ throw `bad getPathChildren; ${destination.dirPath} has no children.` }
        return Object.values(destination.children)
    }
}

type LoaderFileHandler = (file: fs.Dirent, node: LoaderTreeNode) => Promise<void>
const fileHandlers: {[key: string]: LoaderFileHandler | undefined} = {

    ["+page.server.ts"]: async (file, node) => {
        const options: PageOptions = await import( /* @vite-ignore */ new LoaderPathable(`${node.rawPath}/${file.name}`).importPath );
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
