import * as fs from 'fs';
import type { FullUser, FullUserCollection, User } from './types/external';
import type { FollowerMap, UserFollowings } from './types/native';
import { getFollowing, getUser } from './api';

const FASTEROID_ID = 136005972;

function reduceUser( u: FullUser ): User {
    return {
        id:            u.id,
        username:      u.username,
        avatar_url:    u.avatar_url,
        permalink_url: u.permalink_url,
        description:   u.description
    }
}

const me = await getUser(FASTEROID_ID).then(reduceUser);

const direct_following_list: User[] = await getFollowing(FASTEROID_ID).then( (collection: FullUserCollection) => collection.collection.map(reduceUser) );

const direct_following_lookup: {[id: number]: User} = {};
for( let user of direct_following_list ){
    direct_following_lookup[user.id] = user;
}

const user_lookup: {[id: number]: User} = { ...direct_following_lookup, [FASTEROID_ID]: me };

let map: FollowerMap = {
    users: user_lookup,
    nodes: {}
}

for( let user of direct_following_list ){

    const important_indirect_following: User[] = (await getFollowing(user.id)).collection.map(reduceUser).filter( u => u.id in user_lookup ); // could be me too
    map.nodes[user.id] = {
        id: user.id,
        incoming: [ FASTEROID_ID ],
        outgoing: important_indirect_following.map( u => u.id )
    }
    
}

for( let user of Object.values(map.nodes) ){
    for( let id of user.outgoing ){
        if( id in map.nodes ){
            map.nodes[id].incoming.push(user.id);
        }
    }
}

fs.writeFileSync('followermap.json', JSON.stringify(map, null, 2))