import * as fs from 'node:fs/promises';
import { getFollowings, getPopularTracks, getUser } from './api';
import type { ScuffedCloudAPI } from './types/external';
import { FASTEROID_ID } from './constants';
import { getMyFollowings } from './getFollowed';

const FROM_API = false;

export type PopularFollowingTracksIndex = {[user_id: string]: Omit<ScuffedCloudAPI.Track, 'user'>[]}

export async function getPopularFollowingTracks(): Promise<PopularFollowingTracksIndex> {
    if( FROM_API ){
        const direct_following_list: ScuffedCloudAPI.User[] = await getMyFollowings();
        const popular_tracks_index: PopularFollowingTracksIndex = { };
        
        await Promise.all( direct_following_list.map( async user => {
            popular_tracks_index[user.id]  = await getPopularTracks(user.id);
        } ) )

        return popular_tracks_index;
    }
    else {
        return JSON.parse( await fs.readFile('./populartracks.json', 'utf-8') );
    }
}
