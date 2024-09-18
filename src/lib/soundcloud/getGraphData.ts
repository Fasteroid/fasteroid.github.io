import * as fs from 'fs';
import { cacheWrap } from "$lib/utils";
import { getFollowings, getPlaylistTracks } from "./api";
import { FASTEROID_ID } from "./constants";
import { getLikedTracks } from "./getLikedTracks";
import { getPopularFollowingTracks } from "./getPopularFollowingTracks";
import type { ScuffedCloudAPI } from "../types/external";
import type { SoundcloudEdgeData, SoundcloudGraphDataset, SoundcloudNodeData } from "../types/native";
import { AutoMap } from "../utils";

const getCachedPopularity  = cacheWrap<SoundcloudNodeData, number>( getPopularity )
const getCachedFollowings  = cacheWrap( getFollowings );

const liked                    = await getLikedTracks();
const popular_following_tracks = await getPopularFollowingTracks();
const legendary_favorites      = await getPlaylistTracks(1424215180);
const legendary_lookup         = new Map( legendary_favorites.map( (track, idx) => [track.id, idx] ) );
const followings               = await getCachedFollowings(FASTEROID_ID);
const followings_lookup        = new Map( followings.map( u => [u.id, u] ) );
const now                      = Date.now();

function getPopularity(it: SoundcloudNodeData): number {
    return (
        ( it.track.comment_count + 1) * 
        ( it.track.likes_count + 1 ) * 
        it.track.playback_count
    ) ** 2
    / 
    (
        (
            legendary_lookup.get(it.track.id) ??
            ( now - new Date( it.track.created_at ).getTime() )
        )
    )
}

function SoundcloudNodeData(track: Omit<ScuffedCloudAPI.Track, 'user'>, artist: ScuffedCloudAPI.User): SoundcloudNodeData {
    return {
        id: artist.id.toString(),
        track: {
            permalink_url: track.permalink_url,
            duration: track.duration,
            created_at: track.created_at,
            playback_count: track.playback_count,
            likes_count: track.likes_count,
            comment_count: track.comment_count,
            artwork_url: track.artwork_url,
            title: track.title,
            id: track.id
        },
        artist: {
            username: artist.username,
            avatar_url: artist.avatar_url,
            permalink_url: artist.permalink_url,
            followers_count: artist.followers_count,
            followings_count: artist.followings_count,
            description: artist.description,
            track_count: artist.track_count
        }
    }
}

// user => tracks
let pool          = new AutoMap<number, SoundcloudNodeData[]>( () => [] );
let liked_artists = new Set<string>();

for( let like of liked ){
    if( !followings_lookup.has( like.track.user_id ) ) continue; // not following so we don't care

    const track  = like.track;
    const artist = followings_lookup.get( track.user_id )!;

    liked_artists.add( track.user_id + "" )

    pool.get( track.user_id ).push(SoundcloudNodeData(track, artist));
}


for( let [_id, tracks] of Object.entries(popular_following_tracks) ){
    const userID = Number(_id);
    if( liked_artists.has(_id) ) continue; // a better selection exists

    const user = followings_lookup.get(userID)!;

    if( tracks.length === 0 ){
        console.warn(`Wtf ${user.username} has literally no tracks period`);
        continue;
    }

    pool.set( 
        Number(userID), 
        tracks.map( track => SoundcloudNodeData(
            track, 
            user
        ))
    );
}


for( let [userID, summary] of pool ){
    summary.sort( (a, b) => getCachedPopularity(b) - getCachedPopularity(a) );
}

const edges: SoundcloudEdgeData[] = [];

for( let user of followings_lookup.values() ){
    if( user.id === FASTEROID_ID ) continue;

    const linked_direct_following: ScuffedCloudAPI.User[] = (await getCachedFollowings(user.id)).filter( u => followings_lookup.has(u.id) );

    for( let linked of linked_direct_following ){
        if( linked.id === FASTEROID_ID ) continue;
        edges.push({from: user.id.toString(), to: linked.id.toString()});
    }
}

let dataset: SoundcloudGraphDataset = {
    nodes: Array.from( pool.values() ).map( x => x[0] ),
    edges
}


fs.writeFileSync('./graph_soundcloud_v2.json', JSON.stringify(dataset))