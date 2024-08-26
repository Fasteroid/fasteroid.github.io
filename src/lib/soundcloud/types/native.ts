import { GraphDataset, GraphEdgeData, GraphNodeData } from "../../../components/graph/interfaces";
import type { User } from "./external";

export type SoundcloudNodeData = GraphNodeData & Omit<User, 'id'>;

export type SoundcloudEdgeData = GraphEdgeData & { both: boolean };

export type SoundcloudGraphDataset = GraphDataset<SoundcloudNodeData, SoundcloudEdgeData>