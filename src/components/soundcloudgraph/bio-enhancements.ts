 /*
 *  There exist some people I follow on Soundcloud who I have a little more to say about than what's in their description.
 *  This file is a way to say those things.
*/

import type { SoundcloudNodeData } from "$lib/soundcloud/types/native";


type Artist = SoundcloudNodeData["artist"];

type OverrideFunction = (user: Artist) => string;

const OVERRIDE_FUNCTIONS: Map<string, OverrideFunction> = new Map<string, OverrideFunction>()

OVERRIDE_FUNCTIONS.set("557092200", (user: Artist) => {
    return `Cloudier was a duet consisting of Cloudfield (now @mididuck) and Reichuu (now @moonjelly0) from 2019 to 2020.\n\nhttps://soundcloud.com/driftcat/echo is likely their breakup song.`
});

OVERRIDE_FUNCTIONS.set("143194090", (user: Artist) => {
    return user.description + "\n\nformely known as reichuu"
});

OVERRIDE_FUNCTIONS.set("91351883", (user: Artist) => { // EmelUK
    return user.description === "" ? user.description : "Best friends with @stonebank"
});

export function getEnhancedBio(data: SoundcloudNodeData): string {
    let fun = OVERRIDE_FUNCTIONS.get(data.id) ?? function(user: Artist): string { return user.description };
    return fun(data.artist);
}

// looks for a good place to cut it
export function trimBioText(text: string, maxLines: number, maxChars: number): string {

    const all_lines = text.split("\n");

    let ret_lines:    string[] = [];
    let buffer_lines: string[] = [];
    let no_double_break = true;
    let char_count = 0;

    for(let i = 0; i < all_lines.length; i++){
        const line = all_lines[i];

        if( line === "" ){
            no_double_break = false;
            ret_lines.push(...buffer_lines);
            buffer_lines = [];
        }

        char_count += Math.max(line.length, maxChars / maxLines);
        if( char_count >= maxChars ){ break; }

        buffer_lines.push(line);

        if( i >= maxLines ){ break; }
    }

    if( no_double_break ){
        ret_lines.push(...buffer_lines);
    }

    return ret_lines.join("\n");

}