import { getPublicAPIKey } from "./auth";
import { getFullCollection } from "./collections";
import type { ScuffedCloudAPI } from "./types/external";


const CLIENT_ID = await getPublicAPIKey();
const SHARED_HEADERS = {
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "accept-language": "en",
    "cache-control": "no-cache",
    "pragma": "no-cache",
    "upgrade-insecure-requests": "1",
}

export async function getFollowings(userID: number): Promise<ScuffedCloudAPI.User[]> {
    return await getFullCollection<ScuffedCloudAPI.User>(`https://api-v2.soundcloud.com/users/${userID}/followings?limit=100&client_id=${CLIENT_ID}&app_version=1722430138&app_locale=en`, {
        "headers": SHARED_HEADERS,
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET"
    })
}

export async function getPopularTracks(userID: number): Promise<ScuffedCloudAPI.Track[]> {
    return await getFullCollection<ScuffedCloudAPI.Track>(`https://api-v2.soundcloud.com/users/${userID}/toptracks?limit=100&client_id=${CLIENT_ID}&app_version=1722430138&app_locale=en`, {
        "headers": SHARED_HEADERS,
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET"
    })
}

export async function getUser(userID: number): Promise<ScuffedCloudAPI.User> {
    console.log(`Getting user ${userID}`)
    const response = await fetch(`https://api-v2.soundcloud.com/users/${userID}?client_id=${CLIENT_ID}&app_version=1722430138&app_locale=en`, {
        "headers": SHARED_HEADERS,
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET"
    })
    const json = await response.json()
    console.log(`Got user ${userID}`)
    return json;
}

export async function getLikes(userID: number): Promise<ScuffedCloudAPI.Like[]> {
    return await getFullCollection<ScuffedCloudAPI.Like>(`https://api-v2.soundcloud.com/users/136005972/likes?client_id=${CLIENT_ID}&limit=200&app_version=1726585731&app_locale=en`, {
        "headers": SHARED_HEADERS,
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET"
    })
}