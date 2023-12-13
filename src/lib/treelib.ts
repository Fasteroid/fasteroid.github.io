import type { FullPageData } from "./pagedata";

interface TreeNodeData {
    children?:  {[key: string]: TreeNodeData}
    path:       string;
    key:        string;
    pageData?:   FullPageData;
}

export class TreeNode implements TreeNodeData {

    static webBase: string = "";

    children?:  {[key: string]: TreeNode}
    path:       string;
    key:        string;
    pageData!:  FullPageData;

    public get webPath(): string {
        return TreeNode.webBase + this.path.replace("/routes","");
    }

    constructor(path: string, key: string){
        this.path = path;
        this.key = key;
    }

    getChild(key: string): TreeNode {
        if( !this.children ) this.children = {};
        if( !this.children[key] ) this.children[key] = new TreeNode(`${this.path}/${key}`, key)
        return this.children[key];
    }

    getChildren(): TreeNode[] {
        return Object.values( this.children || {} )
    }

    getChildrenAtPath(path: string): TreeNode[] {
        let chain: string[] = path.split("/").slice(1)
        let destination: TreeNode = this;
        for( let link of chain ){
            if( link.length < 1 ){ throw "bad getPathChildren; malformed." }
            if( !destination.children ){ throw `bad getPathChildren; ${destination.path} has no children.` }
            if( !destination.children[link] ){ throw `bad getPathChildren; ${destination.path} does not have ${link}.` }
            destination = destination.children[link];
        }
        return destination.getChildren()
    }

    static fromJSON(json: TreeNodeData): TreeNode {
        const obj = new TreeNode(json.path, json.key)
        if( json.pageData ) obj.pageData = json.pageData;
        if( json.children ) {
            obj.children = { }
            for( let [key, node] of Object.entries(json.children) ){
                obj.children[key] = TreeNode.fromJSON(node);
            }
        }
        return obj
    }

    static setWebBase(base: string){
        TreeNode.webBase = base
    }

}