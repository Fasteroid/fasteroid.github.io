import { GraphDataset, GraphEdgeData, GraphNodeData } from "../../../components/graph/interfaces";
import type { ScuffedCloudAPI } from "./external";

export type SoundcloudNodeData = GraphNodeData & Pick<ScuffedCloudAPI.User, 
    'username'        | 
    'avatar_url'      | 
    'permalink_url'   | 
    'description'     | 
    'followers_count'
>;

export type SoundcloudEdgeData = GraphEdgeData;

export type SoundcloudGraphDataset = GraphDataset<SoundcloudNodeData, SoundcloudEdgeData>

export type SoundcloudLikedTrack = {
    created_at: string;
    track:      ScuffedCloudAPI.Track;
}