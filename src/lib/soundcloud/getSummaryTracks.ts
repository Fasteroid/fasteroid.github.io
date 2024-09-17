import * as fs from 'fs';
import { getFollowing, getPopularTracks, getUser } from './api';
import type { ScuffedCloudAPI } from './types/external';

const FASTEROID_ID = 136005972;

let direct_following_list: ScuffedCloudAPI.User[] = await getFollowing(FASTEROID_ID)

direct_following_list = direct_following_list.slice(0, 20); // for testing

const each_popular_tracks_map: Map<ScuffedCloudAPI.User, ScuffedCloudAPI.Track[]> = new Map();

await Promise.all( direct_following_list.map( async user => {
    each_popular_tracks_map.set(user, await getPopularTracks(user.id));
} ) )

function ranking_likesAndPlaysDividedByAge( track: ScuffedCloudAPI.Track ){
    const uploadDate = new Date(track.created_at);
    const age = Date.now() - uploadDate.getTime();

    return track.playback_count * track.likes_count / age;
}


for( let [user, tracks] of each_popular_tracks_map ){
    const best = tracks.reduce(
        (a, b) => ranking_likesAndPlaysDividedByAge(a) > ranking_likesAndPlaysDividedByAge(b) ? a : b
);
    console.log(`${user.username} - \n${best.title}\n${best.permalink_url}\n`);
}