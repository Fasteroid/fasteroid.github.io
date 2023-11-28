export interface SkillTreeNodeData {
    name: string;
}

export interface DynamicSkillTreeNodeData extends SkillTreeNodeData {
    parents: {[name: string]: number}
    desc:    string[]  
    style:   string;
}

export interface StaticSkillTreeNodeData extends SkillTreeNodeData {
    x: number,
    y: number,
    tier: number,
}