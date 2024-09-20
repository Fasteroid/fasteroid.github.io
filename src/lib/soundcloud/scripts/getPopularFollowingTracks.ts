import * as fs from 'node:fs/promises';
import { getFollowings, getPopularTracks, getUser } from './api';
import type { ScuffedCloudAPI } from '../types/external';
import { FASTEROID_ID, USE_API } from './constants';
import { getMyFollowings } from './getFollowed';

export type PopularFollowingTracksIndex = {[user_id: string]: Omit<ScuffedCloudAPI.Track, 'user'>[]}

export async function getPopularFollowingTracks(): Promise<PopularFollowingTracksIndex> {
    if( USE_API ){
        const direct_following_list: ScuffedCloudAPI.User[] = await getMyFollowings();
        const popular_tracks_index: PopularFollowingTracksIndex = { };
        
        await Promise.all( direct_following_list.map( async user => {
            popular_tracks_index[user.id]  = await getPopularTracks(user.id);
        } ) )

        fs.writeFile('./temp/populartracks.json', JSON.stringify(popular_tracks_index));

        return popular_tracks_index;
    }
    else {
        return JSON.parse( await fs.readFile('./temp/populartracks.json', 'utf-8') );
    }
}
