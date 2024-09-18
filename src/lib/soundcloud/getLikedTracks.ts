import * as fs from 'node:fs/promises';
import { getFollowings, getLikes, getPopularTracks, getUser } from './api';
import type { SoundcloudLikedTrack } from './types/native';
import { FASTEROID_ID } from './constants';

const FROM_API = false;

export async function getLikedTracks(): Promise<SoundcloudLikedTrack[]> {
    if( FROM_API ){
        let likes = (await getLikes(FASTEROID_ID)).filter(like => like.track !== undefined) as SoundcloudLikedTrack[];
        fs.writeFile('./likes.json', JSON.stringify(likes));
        return likes;
    }
    else {
        return JSON.parse( await fs.readFile('./likes.json', 'utf-8') );
    }
}
