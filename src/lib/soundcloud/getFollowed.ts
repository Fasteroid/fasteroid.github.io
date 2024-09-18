import * as fs from 'node:fs/promises';
import { getFollowings, getLikes, getPopularTracks, getUser } from './api';
import type { SoundcloudLikedTrack } from './types/native';
import { FASTEROID_ID } from './constants';
import type { ScuffedCloudAPI } from './types/external';

const FROM_API = false;

export async function getMyFollowings(): Promise<ScuffedCloudAPI.User[]> {
    if( FROM_API ){
        let followings = (await getFollowings(FASTEROID_ID))
        fs.writeFile('./myfollowings.json', JSON.stringify(followings));
        return followings;
    }
    else {
        return JSON.parse( await fs.readFile('./myfollowings.json', 'utf-8') );
    }
}
