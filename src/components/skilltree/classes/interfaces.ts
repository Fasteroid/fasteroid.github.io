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