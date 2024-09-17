import { getPublicAPIKey } from "./auth";
import type { CollectionResponse, FullUser } from "./types/external";

const CLIENT_ID = await getPublicAPIKey();

const SHARED_HEADERS = {
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "accept-language": "en",
    "cache-control": "no-cache",
    "pragma": "no-cache",
    "upgrade-insecure-requests": "1",
}

async function getPartialCollection<T>(url: string, headers: RequestInit, offset: number = 0): Promise< CollectionResponse<T> > {
    let ans: CollectionResponse<T> | undefined;

    while( ans === undefined ){
        try { // because I bet now that this is fixed, I'm going to get rate-limited (lol)
            console.log(`➡️  Getting ${url}, offset = ${offset}...`)
            const response = await fetch(`${url}&offset=${offset}`, headers)
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

async function getFullCollection<T>(url: string, headers: RequestInit): Promise< T[] > {
    let data: T[] = [];

    let initial = await getPartialCollection<T>(url, headers)
    data.push( ...initial.collection )

    while( initial.next_href !== null ){
        let offset = new URL(initial.next_href).searchParams.get('offset');
        if( offset === null ){
            console.trace(`Couldn't get offset from ${initial.next_href}`);
            break;
        }
        let next = await getPartialCollection<T>(url, headers, parseInt(offset));
        data.push( ...next.collection );
        initial = next;
    }

    return data;
}


export async function getFollowing(id: number): Promise<FullUser[]> {
    return await getFullCollection<FullUser>(`https://api-v2.soundcloud.com/users/${id}/followings?limit=100&client_id=${CLIENT_ID}&app_version=1722430138&app_locale=en`, {
        "headers": SHARED_HEADERS,
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET"
    })
}

export async function getUser(id: number): Promise<FullUser> {
    console.log(`Getting user ${id}`)
    const response = await fetch(`https://api-v2.soundcloud.com/users/${id}?client_id=${CLIENT_ID}&app_version=1722430138&app_locale=en`, {
        "headers": SHARED_HEADERS,
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET"
    })
    const json = await response.json()
    console.log(`Got user ${id}`)
    return json;
}