/**
 * Dataset for a graph of nodes. Associates data and relations with node IDs.
 */
export interface GraphDataset<
    NodeData extends GraphNodeData = GraphNodeData,
    EdgeData extends GraphEdgeData = GraphEdgeData
> {
    nodes: { [key: string]: NodeData }
    edges: EdgeData[]
}

export interface GraphNodeData {
    id: string
}

export interface GraphEdgeData {
    from: string
    to:   string
}