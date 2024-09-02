import type { FollowingsAPIResponse, FullUser } from "./types/external";

const CLIENT_ID = "lPP5wRG1UkRxNZhnYd7OVc4umoqzySTZ"; // default when logged out, seems to be consistent no matter where you are in the world...



async function getPartialFollowing(id: number, offset: number = 0): Promise<FollowingsAPIResponse> {
    console.log(`➡️  Getting following of ${id}, offset = ${offset}...`)
    let ans: FollowingsAPIResponse | undefined;

    while( ans === undefined ){
        try { // because I bet now that this is fixed, I'm going to get rate-limited (lol)
            const response = await fetch(`https://api-v2.soundcloud.com/users/${id}/followings?limit=100&client_id=${CLIENT_ID}&app_version=1722430138&app_locale=en&offset=${offset}`, {
                "headers": {
                    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                    "accept-language": "en",
                    "cache-control": "no-cache",
                    "pragma": "no-cache",
                    "upgrade-insecure-requests": "1",
                },
                "referrerPolicy": "strict-origin-when-cross-origin",
                "body": null,
                "method": "GET"
            })
            ans = await response.json()
        }
        catch(e){
            console.warn("❌ Got rate limited or something:");
            console.warn(e);

            // wait a minute (a guess) for rate limit to reset
            await new Promise( resolve => setTimeout(resolve, 60000) );
            console.log("🔄 Trying again...")
        }
    }
    
    return ans;
}

let cache: Map<number, FullUser[]>  = new Map();
export async function getFollowing(id: number): Promise<FullUser[]> {

    let cached = cache.get(id);
    if( cached !== undefined ) {
        console.log(`Woohoo ${id} was cached already!!!1`)
        return cached;
    }

    let users: FullUser[] = [];

    let initial = await getPartialFollowing(id)
    users.push( ...initial.collection )

    while( initial.next_href !== null ){
        let offset = new URL(initial.next_href).searchParams.get('offset');
        if( offset === null ){
            console.trace(`Couldn't get offset from ${initial.next_href}`);
            break;
        }
        let next = await getPartialFollowing(id, parseInt(offset));
        users.push( ...next.collection );
        initial = next;
    }

    console.log(`✅ ${id} is following ${users.length} users`)

    cache.set(id, users);
    
    return users;
}

export async function getUser(id: number): Promise<FullUser> {
    console.log(`Getting user ${id}`)
    const response = await fetch(`https://api-v2.soundcloud.com/users/${id}?client_id=${CLIENT_ID}&app_version=1722430138&app_locale=en`, {
        "headers": {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "accept-language": "en",
            "cache-control": "no-cache",
            "pragma": "no-cache",
            "upgrade-insecure-requests": "1",
        },
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET"
    })
    const json = await response.json()
    console.log(`Got user ${id}`)
    return json;
}