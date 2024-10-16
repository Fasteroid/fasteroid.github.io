 /*
 *  There exist some people I follow on Soundcloud who I have a little more to say about than what's in their description.
 *  This file is a way to say those things.
*/

import type { SoundcloudNodeData } from "$lib/soundcloud/types/native";


type Artist = SoundcloudNodeData["artist"];

type OverrideFunction = (user: Artist) => string;

const OVERRIDE_FUNCTIONS: Map<string, OverrideFunction> = new Map<string, OverrideFunction>()

OVERRIDE_FUNCTIONS.set("557092200", (user: Artist) => {
    return `Cloudier was the musical love story of Cloudfield and Reichuu.\n\nNow under new aliases as @mididuck and @moonjelly0, all that remains is an echo of their dreams.`
});

OVERRIDE_FUNCTIONS.set("143194090", (user: Artist) => {
    return user.description + "\n\nformely known as reichuu"
});

OVERRIDE_FUNCTIONS.set("91351883", (user: Artist) => { // EmelUK
    return user.description === "" ? user.description : "Best friends with @stonebank"
});

export function getEnhancedBio(data: SoundcloudNodeData): string {
    let fun = OVERRIDE_FUNCTIONS.get(data.id) ?? function(user: Artist): string { return user.description };

    let ret = fun(data.artist);
    if( ret === "" ){ ret = "This artist has not written anything about themselves." }

    return ret;
}

// looks for a good place to cut it
export function trimBioText(text: string, maxLines: number, maxChars: number): string {

    const all_lines = text.split("\n");

    let ret_lines:    string[] = [];
    let buffer_lines: string[] = [];
    let early_exit = false;
    let char_count = 0;

    for(let i = 0; i < all_lines.length; i++){
        const line = all_lines[i];

        if( line === "" ){
            ret_lines.push(...buffer_lines);
            buffer_lines = [];
        }

        char_count += Math.max(line.length, maxChars / maxLines);
        if( char_count >= maxChars ){ 
            early_exit = true;
            break; 
        }

        buffer_lines.push(line);

        if( i >= maxLines ){ 
            early_exit = true;
            break; 
        }
    }

    if( !early_exit ){
        ret_lines.push(...buffer_lines);
    }

    return ret_lines.join("\n").trimEnd();

}