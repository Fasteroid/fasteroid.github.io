import * as fs from 'node:fs/promises';
import { getFollowings, getLikes, getPopularTracks, getUser } from './api';
import type { SoundcloudLikedTrack } from '../types/native';
import { FASTEROID_ID } from './constants';

const FROM_API = true;

export async function getLikedTracks(): Promise<SoundcloudLikedTrack[]> {
    if( FROM_API ){
        console.log("getting likes from api")
        let likes = (await getLikes(FASTEROID_ID)).filter(like => like.track !== undefined) as SoundcloudLikedTrack[];
        fs.writeFile('./temp/likes.json', JSON.stringify(likes));
        return likes;
    }
    else {
        return JSON.parse( await fs.readFile('./temp/likes.json', 'utf-8') );
    }
}
