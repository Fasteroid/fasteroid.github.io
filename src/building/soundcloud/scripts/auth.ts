
const scriptFinder = /(https:\/\/a-v2\.sndcdn\.com\/.*?\.js)"/gm;
const keyFinder    = /client_id:"(.*?)"/;

export async function getPublicAPIKey(){
    let page = (await (await fetch('https://soundcloud.com')).text());

    let matches = Array.from( page.matchAll(scriptFinder) );

    for( let match of matches ){
        let url = match[1];
        let script = (await (await fetch(url)).text());
        let token = script.match(keyFinder);
        if( token ){
            console.log(`🔑 Got public API key: ${token[1]}`);
            return token[1];
        }
    }
}