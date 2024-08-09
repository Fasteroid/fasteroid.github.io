export interface GraphNodeRelation {
    to:   (string | number)[]
    from: (string | number)[]
}

/**
 * Dataset for a graph of nodes. Associates data and relations with node IDs.
 */
export interface GraphNodeDataset<T extends GraphNodeData> {
    data:      { [key: string | number]: T }
    relations: { [key: string | number]: GraphNodeRelation }
}

export interface GraphNodeData {
    id: string | number
}