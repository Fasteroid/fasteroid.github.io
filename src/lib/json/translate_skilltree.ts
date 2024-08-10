import { readFileSync, writeFileSync } from 'fs';
import type { DynamicSkillTreeNodeData2, SkillTreeDataSet, SkillTreeDataSet2, SkillTreeEdgeData, StaticSkillTreeNodeData2 } from '../../components/skilltree/classes/interfaces';

// 8/10/2024

let data = JSON.parse( readFileSync('skilltree.json', 'utf8') ) as SkillTreeDataSet;

let new_data: SkillTreeDataSet2 = {
    nodes: {},
    edges: []
}

for( const node of data.staticNodes ){

    let new_node: StaticSkillTreeNodeData2 = {
        id:   node.name,
        x:    node.x,
        y:    node.y,
        tier: node.tier,
        type: "static"
    }

    new_data.nodes[node.name] = new_node;

    // no edges to process for static nodes since they are all parentless

}

for( const node of data.dynamicNodes ){

    let new_node: DynamicSkillTreeNodeData2 = {
        id:    node.name,
        x:     node.x,
        y:     node.y,
        desc:  node.desc,
        style: node.style,
        type:  "dynamic"
    }

    new_data.nodes[node.name] = new_node;

    for( const parent of node.parents ){

        let new_edge: SkillTreeEdgeData = {
            from: parent.name,
            to:   node.name,
            dist: parent.dist
        }

        new_data.edges.push(new_edge)
    }

}

writeFileSync('graph_skilltree.json', JSON.stringify(new_data, undefined, 4))