import { GraphDataset, GraphEdgeData, GraphNodeData } from "../../../components/graph/interfaces";
import { ScuffedCloudAPI } from "./external";

export type SoundcloudNodeData = GraphNodeData & Pick<ScuffedCloudAPI.User, 
    'username'        | 
    'avatar_url'      | 
    'permalink_url'   | 
    'description'     | 
    'followers_count'
>;

export type SoundcloudEdgeData = GraphEdgeData;

export type SoundcloudGraphDataset = GraphDataset<SoundcloudNodeData, SoundcloudEdgeData>