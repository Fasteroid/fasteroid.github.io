import * as fs from 'fs';
import { cacheWrap, groupBy } from "$lib/utils";
import { getFollowings, getPlaylistTracks } from "./scripts/api";
import { FASTEROID_ID } from "./scripts/constants";
import { getLikedTracks } from "./scripts/getLikedTracks";
import { getPopularFollowingTracks } from "./scripts/getPopularFollowingTracks";
import type { ScuffedCloudAPI } from "./types/external";
import type { SoundcloudEdgeData, SoundcloudGraphDataset, SoundcloudNodeData } from "./types/native";
import { AutoMap } from "./scripts/automap";

const UPDATE_EDGES: boolean = false;

const getCachedPopularity  = cacheWrap<SoundcloudNodeTrack, number>( getPopularity )
const getCachedFollowings  = cacheWrap( getFollowings );

const liked                    = await getLikedTracks();
const liked_by_artist          = groupBy( liked, it => it.track.user_id );
const popular_following_tracks = await getPopularFollowingTracks();
const legendary_favorites      = await getPlaylistTracks(1424215180);
const legendary_lookup         = new Map( legendary_favorites.map( (track, idx) => [track.id, idx] ) );
const legendary_by_artist      = groupBy( legendary_favorites, it => it.user_id );
const followings               = await getCachedFollowings(FASTEROID_ID);
const followings_lookup        = new Map( followings.map( u => [u.id, u] ) );
const now                      = Date.now();

function getPopularity(it: SoundcloudNodeTrack): number {
    return (
        ( it.comment_count + 1) * 
        ( it.likes_count + 1 ) * 
        it.playback_count
    ) ** 2
    / 
    (
        (
            legendary_lookup.get(it.id) ??
            ( now - new Date( it.created_at ).getTime() )
        )
    )
}

function SoundcloudNodeData(track: Omit<ScuffedCloudAPI.Track, 'user'> | undefined, artist: ScuffedCloudAPI.User): SoundcloudNodeData {
    let initial: SoundcloudNodeData = {
        id: artist.id.toString(),
        artist: {
            username: artist.username,
            avatar_url: artist.avatar_url,
            permalink_url: artist.permalink_url,
            followers_count: artist.followers_count,
            followings_count: artist.followings_count,
            description: artist.description,
            track_count: artist.track_count,
            likes_count:     liked_by_artist.get(artist.id)?.length ?? 0,
            favorites_count: legendary_by_artist.get(artist.id)?.length ?? 0
        }
    }
    if( track !== undefined ){
        initial.track = {
            permalink_url: track.permalink_url,
            duration: track.duration,
            created_at: track.created_at,
            playback_count: track.playback_count,
            likes_count: track.likes_count,
            comment_count: track.comment_count,
            artwork_url: track.artwork_url,
            title: track.title,
            id: track.id
        }
    }
    return initial;
}

type SoundcloudNodeTrack = Exclude<SoundcloudNodeData['track'], undefined>;

// user => tracks
let pool          = new AutoMap<number, Omit<ScuffedCloudAPI.Track, 'user'>[]>( () => [] );
let liked_artists = new Set<string>();

for( let like of liked ){
    if( !followings_lookup.has( like.track.user_id ) ) continue; // not following so we don't care

    const track  = like.track;

    liked_artists.add( track.user_id + "" )

    pool.get( track.user_id ).push( track );
}


for( let [_id, tracks] of Object.entries(popular_following_tracks) ){
    const userID = Number(_id);
    if( liked_artists.has(_id) ) continue; // a better selection exists

    const user = followings_lookup.get(userID)!;

    if( tracks.length === 0 ){
        console.warn(`Wtf ${user?.username} (${userID}) has literally no tracks period`); // TODO: check their reposts if we get here
    }

    pool.set( 
        Number(userID), 
        tracks
    );
}


for( let [_, trackChoices] of pool ){
    trackChoices.sort( (a, b) => getCachedPopularity(b) - getCachedPopularity(a) );
}

let edges: SoundcloudEdgeData[] = [];

if( UPDATE_EDGES ){
    for( let user of followings_lookup.values() ){
        if( user.id === FASTEROID_ID ) continue;

        const linked_direct_following: ScuffedCloudAPI.User[] = (await getCachedFollowings(user.id)).filter( u => followings_lookup.has(u.id) );

        for( let linked of linked_direct_following ){
            if( linked.id === FASTEROID_ID ) continue;
            edges.push({from: user.id.toString(), to: linked.id.toString()});
        }
    }
}
else {
    edges = JSON.parse( fs.readFileSync('./graph_soundcloud_v2.json', 'utf-8') ).edges;
}

let dataset: SoundcloudGraphDataset = {
    nodes: Array.from( pool.entries() ).map( (kv) => {
        return SoundcloudNodeData( kv[1][0], followings_lookup.get(kv[0])! )
    } ),
    edges
}


fs.writeFileSync('./graph_soundcloud_v2.json', JSON.stringify(dataset))