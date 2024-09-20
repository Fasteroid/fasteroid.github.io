import { GraphDataset, GraphEdgeData, GraphNodeData } from "../../../components/graph/interfaces";
import type { ScuffedCloudAPI } from "./external";

export type SoundcloudEdgeData = GraphEdgeData;

export type SoundcloudGraphDataset = GraphDataset<SoundcloudNodeData, SoundcloudEdgeData>

export type SoundcloudLikedTrack = {
    created_at: string;
    track:      ScuffedCloudAPI.Track;
}

export type SoundcloudNodeData = GraphNodeData & {
    track?: Pick<ScuffedCloudAPI.Track,
        'permalink_url'  |
        'duration'       |
        'created_at'     |
        'playback_count' |
        'likes_count'    |
        'comment_count'  |
        'artwork_url'    |
        'title'          |
        'id'
    >,
    artist: Pick<ScuffedCloudAPI.User,
        'username'         |
        'avatar_url'       |
        'permalink_url'    |
        'followers_count'  |
        'followings_count' |
        'description'      |
        'track_count'
    >
}