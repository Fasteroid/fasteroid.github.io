import { getPopularTracks } from './api';
import { getMyFollowings } from './getFollowed';
import type { ScuffedCloudAPI } from '../../../lib/soundcloud/types_external';

export type PopularFollowingTracksIndex = {[user_id: string]: Omit<ScuffedCloudAPI.Track, 'user'>[]}

export async function getPopularFollowingTracks(): Promise<PopularFollowingTracksIndex> {

    const direct_following_list: ScuffedCloudAPI.User[] = await getMyFollowings();
    const popular_tracks_index: PopularFollowingTracksIndex = { };
    
    await Promise.all( direct_following_list.map( async user => {
        popular_tracks_index[user.id]  = await getPopularTracks(user.id);
    } ) )

    return popular_tracks_index;

}
