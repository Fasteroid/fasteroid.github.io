import * as fs from 'fs';
import { getFollowings, getUser } from './api';
import type { SoundcloudEdgeData, SoundcloudGraphDataset, SoundcloudNodeData } from './types/native';
import { Map2D } from '$lib/utils';
import type { ScuffedCloudAPI } from './types/external';

const FASTEROID_ID = 136005972;

function toNode( u: ScuffedCloudAPI.User ): SoundcloudNodeData {
    let ret: SoundcloudNodeData = {
        id:              u.id.toString(),
        username:        u.username,
        avatar_url:      u.avatar_url,
        permalink_url:   u.permalink_url,
        description:     u.description,
        followers_count: u.followers_count,
    }
    return ret;
}

const me = await getUser(FASTEROID_ID);

const direct_following_list: ScuffedCloudAPI.User[] = await getFollowings(FASTEROID_ID)

if( !direct_following_list.some(user => user.username == "acloudyskye") ){
    console.warn("NO ACLOUDYSKYE???"); // sanity test, he got missed once somehow
}

const direct_following_lookup: {[id: number]: ScuffedCloudAPI.User} = {};
for( let user of direct_following_list ){
    direct_following_lookup[user.id] = user;
}

const edges: SoundcloudEdgeData[] = [];

for( let user of direct_following_list ){

    if( user.id === FASTEROID_ID ) continue;

    const linked_direct_following: ScuffedCloudAPI.User[] = (await getFollowings(user.id)).filter( u => u.id in direct_following_lookup );

    for( let linked of linked_direct_following ){
        if( linked.id === FASTEROID_ID ) continue;
        edges.push({from: user.id.toString(), to: linked.id.toString()});
    }
    
}

let dataset: SoundcloudGraphDataset = {
    nodes: direct_following_list.map(toNode),
    edges
}


fs.writeFileSync('../json/followermap.json', JSON.stringify(dataset))