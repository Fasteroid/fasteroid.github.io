import type { GraphDataset, GraphEdgeData, GraphNodeData } from "../graph/interfaces";

export type SkillTreeDataSet = GraphDataset<SkillTreeNodeData, SkillTreeEdgeData>

export interface SkillTreeNodeData extends GraphNodeData {
    x?:   number,
    y?:   number,
    type: "dynamic" | "static",
}

export interface SkillTreeDynamicNodeData extends SkillTreeNodeData {
    desc:  string[],
    style: string
    type:  "dynamic"
}

export interface SkillTreeStaticNodeData extends SkillTreeNodeData {
    x:    number,
    y:    number,
    tier: number
    type: "static"
}

export interface SkillTreeEdgeData extends GraphEdgeData {
    dist: number
}