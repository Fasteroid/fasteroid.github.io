import * as fs from 'fs';
import { getFollowings, getPlaylistTracks } from './scripts/api';
import { FASTEROID_ID } from './scripts/constants';
import { getLikedTracks } from './scripts/getLikedTracks';



const liked_tracks             = await getLikedTracks();
const following_who            = await getFollowings(FASTEROID_ID);
const legendary_favorites      = await getPlaylistTracks(1424215180);
const classic_favorites        = await getPlaylistTracks(1596510016);

fs.writeFileSync('./soundcloud_backup.json', JSON.stringify({
    liked_tracks,
    following_who,
    legendary_favorites,
    classic_favorites,
}));