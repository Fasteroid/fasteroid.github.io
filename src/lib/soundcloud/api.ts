import type { FullUser, FullUserCollection } from "./types/external";

const CLIENT_ID = "lPP5wRG1UkRxNZhnYd7OVc4umoqzySTZ"; // default when logged out, seems to be consistent no matter where you are in the world...

export async function getFollowing(id: number): Promise<FullUserCollection> {
    console.log(`Getting following of ${id}`)
    const response = await fetch(`https://api-v2.soundcloud.com/users/${id}/followings?limit=500&client_id=${CLIENT_ID}&app_version=1722430138&app_locale=en`, {
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
    console.log(`Got following of ${id}`)
    return json;
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