import { GraphEdgeData, GraphNodeData, GraphDataset } from "../../graph/interfaces";

export type SkillTreeParentRef = {
    name: string,
    dist: number
}

export interface SkillTreeNodeData {
    x?: number,
    y?: number,
    name: string
}

export interface DynamicSkillTreeNodeData extends SkillTreeNodeData {
    parents: SkillTreeParentRef[],
    desc:    string[],
    style:   string
}

export interface StaticSkillTreeNodeData extends SkillTreeNodeData {
    x: number,
    y: number,
    tier: number
}

export interface SkillTreeDataSet {
    staticNodes: StaticSkillTreeNodeData[],
    dynamicNodes: DynamicSkillTreeNodeData[]
}


export type SkillTreeDataSet2 = GraphDataset<SkillTreeNodeData2, SkillTreeEdgeData>

export interface SkillTreeNodeData2 extends GraphNodeData {
    x?:   number,
    y?:   number,
    type: "dynamic" | "static",
}

export interface DynamicSkillTreeNodeData2 extends SkillTreeNodeData2 {
    desc:  string[],
    style: string
    type:  "dynamic"
}

export interface StaticSkillTreeNodeData2 extends SkillTreeNodeData2 {
    x:    number,
    y:    number,
    tier: number
    type: "static"
}

export interface SkillTreeEdgeData extends GraphEdgeData {
    dist: number
}