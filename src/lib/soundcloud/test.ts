import * as fs from 'fs';
import type { FullUser, FullUserCollection, User } from './types/external';
import { getFollowing, getUser } from './api';
import type { SoundcloudEdgeData, SoundcloudGraphDataset, SoundcloudNodeData } from './types/native';
import { Map2D } from '$lib/utils';

const FASTEROID_ID = 136005972;

function toNode( u: FullUser ): SoundcloudNodeData {
    return {
        id:            u.id.toString(),
        username:      u.username,
        avatar_url:    u.avatar_url,
        permalink_url: u.permalink_url,
        description:   u.description
    }
}

const me = await getUser(FASTEROID_ID);

const direct_following_list: FullUser[] = await getFollowing(FASTEROID_ID).then( (collection: FullUserCollection) => collection.collection );

const direct_following_lookup: {[id: number]: FullUser} = {};
for( let user of direct_following_list ){
    direct_following_lookup[user.id] = user;
}

direct_following_lookup[FASTEROID_ID] = me;

const edge_parity: Map2D<number, boolean> = new Map2D();

for( let user of direct_following_list ){
    const linked_direct_following: FullUser[] = (await getFollowing(user.id)).collection.filter( u => u.id in direct_following_lookup ); // could be me too

    for( let linked of linked_direct_following ){
        
        if( edge_parity.has(linked.id, user.id) ){
            edge_parity.set(user.id, linked.id, true); // bidirectional
            continue;
        }

        edge_parity.set(user.id, linked.id, false);

    }
}

const edges: SoundcloudEdgeData[] = [];
edge_parity.forEach( (both, id1, id2) => {
    edges.push({
        from: id1.toString(),
        to:   id2.toString(),
        both
    })
})

let dataset: SoundcloudGraphDataset = {
    nodes: direct_following_list.map(toNode),
    edges
}


fs.writeFileSync('followermap.json', JSON.stringify(dataset, null, 2))