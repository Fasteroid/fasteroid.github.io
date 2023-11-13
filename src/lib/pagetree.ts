import { base } from '$app/paths';
import data from './json/pagetree.json'
import { TreeNode } from './treelib'

TreeNode.setWebBase(base)
export const pagetree = TreeNode.fromJSON(data)