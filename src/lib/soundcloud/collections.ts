interface CollectionResponse<T> {
    collection: T[];
    next_href: string | null;
}

async function getPartialCollection<T>(url: string, headers: RequestInit, offset: string = "0"): Promise< CollectionResponse<T> > {
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

export async function getFullCollection<T>(url: string, headers: RequestInit): Promise< T[] > {
    let data: T[] = [];

    let initial = await getPartialCollection<T>(url, headers)
    data.push( ...initial.collection )

    while( initial.next_href !== null ){
        let offset = new URL(initial.next_href).searchParams.get('offset');
        if( offset === null ){
            console.trace(`Couldn't get offset from ${initial.next_href}`);
            break;
        }
        let next = await getPartialCollection<T>(url, headers, offset);
        data.push( ...next.collection );
        initial = next;
    }

    return data;
}