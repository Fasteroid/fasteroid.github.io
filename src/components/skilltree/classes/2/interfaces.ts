/**
 * Dataset for a graph of nodes. Associates data and relations with node IDs.
 */
export interface GraphNodeDataset<T extends GraphNodeData> {
    nodes: { [key: string | number]: T }
    edges: GraphEdgeData[]
}

export interface GraphNodeData {
    id: string | number
}

export interface GraphEdgeData {
    node1: string | number
    node2: string | number
}