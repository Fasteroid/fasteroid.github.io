import { GraphDataset, GraphEdgeData, GraphNodeData } from "../../../components/graph/interfaces";
import type { User } from "./external";

export type SoundcloudNodeData = GraphNodeData & Omit<User, 'id'> & {
    x?:    number
    y?:    number
    root?: true
};

export type SoundcloudEdgeData = GraphEdgeData;

export type SoundcloudGraphDataset = GraphDataset<SoundcloudNodeData, SoundcloudEdgeData>