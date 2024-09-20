import * as fs from 'node:fs/promises';
import { getFollowings, getLikes, getPopularTracks, getUser } from './api';
import type { SoundcloudLikedTrack } from '../types/native';
import { FASTEROID_ID, USE_API } from './constants';
import type { ScuffedCloudAPI } from '../types/external';

export async function getMyFollowings(): Promise<ScuffedCloudAPI.User[]> {
    if( USE_API ){
        let followings = (await getFollowings(FASTEROID_ID))
        fs.writeFile('./temp/myfollowings.json', JSON.stringify(followings));
        return followings;
    }
    else {
        return JSON.parse( await fs.readFile('./temp/myfollowings.json', 'utf-8') );
    }
}
