import * as fs from 'fs';
import type { FullUser, FullUserCollection, User } from './types/external';
import { getFollowing, getUser } from './api';
import type { SoundcloudEdgeData, SoundcloudGraphDataset, SoundcloudNodeData } from './types/native';
import { Map2D } from '$lib/utils';

const FASTEROID_ID = 136005972;

function toNode( u: FullUser ): SoundcloudNodeData {
    let ret: SoundcloudNodeData = {
        id:            u.id.toString(),
        username:      u.username,
        avatar_url:    u.avatar_url,
        permalink_url: u.permalink_url,
        description:   u.description
    }
    if( u.id === FASTEROID_ID ){
        ret.root = true;
    }
    return ret;
}

const me = await getUser(FASTEROID_ID);

const direct_following_list: FullUser[] = await getFollowing(FASTEROID_ID).then( (collection: FullUserCollection) => collection.collection );

const direct_following_lookup: {[id: number]: FullUser} = {};
for( let user of direct_following_list ){
    direct_following_lookup[user.id] = user;
}

const edges: SoundcloudEdgeData[] = [];

for( let user of direct_following_list ){
    if( user.id === FASTEROID_ID ) continue;
    const linked_direct_following: FullUser[] = (await getFollowing(user.id)).collection.filter( u => u.id in direct_following_lookup ); // could be me too
    for( let linked of linked_direct_following ){
        if( linked.id === FASTEROID_ID ) continue;
        edges.push({from: user.id.toString(), to: linked.id.toString()});
    }
}

let dataset: SoundcloudGraphDataset = {
    nodes: direct_following_list.map(toNode),
    edges
}


fs.writeFileSync('followermap.json', JSON.stringify(dataset, null, 2))