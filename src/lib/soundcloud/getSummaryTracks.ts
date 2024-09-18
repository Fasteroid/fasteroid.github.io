import { getFollowings } from "./api";
import { FASTEROID_ID } from "./constants";
import { getMyFollowings } from "./getFollowed";
import { getLikedTracks }  from "./getLikedTracks";
import type { ScuffedCloudAPI } from "./types/external";
import type { SoundcloudLikedTrack } from "./types/native";
import { AutoMap, LookupCache } from "./utils";

const METRIC: number = 0.2;

const ALIGNMENT_TEST: {[artist: string]: string[]} = {
    "acloudyskye"         : ["surface", "overthrower", "safety!"],
    "moe shop"            : ["you look so good"],
    "kotori"              : ["nanamori"],
    "synthion"            : ["aurora", "submerge", "starlight"],
    "becko"               : ["reborn"],
    "ujico*/snail's house": ["pixel galaxy"],
    "tyler inktome"       : ["aureolin"],
    "tenkitsune"          : ["little fox wonderland", "infinity"],
    "porter robinson"     : ["shelter"],
    "iglooghost"          : ["bug thief"],
    "mididuck"            : ["solace", "overwhelmed", "unstable"],
    "geoxor"              : ["virtual"],
    "echorift"            : ["monolith"],
    "the caracal project" : ["de merde"],
    "yandere"             : ["afterglow ep", "y2k forever ep"],
    "plusol"              : ["clock", "oracle"],
    "phritz"              : ["summit", "daydreams"],
    "defsharp"            : ["glass fort", "offense mechanism", "get older"],
    "airuei"              : ["aquamarine", "points"],
    "moon jelly"          : ["one day"],
    "driftcat"            : ["echo", "heal"],
    "aika 🌸"             : ["dear me", "calamity rhapsody", "triple threat"],
    "stonebank"           : ["stronger", "all night"]
}

let SCORE = 0;

function checkPassedTest(user: ScuffedCloudAPI.User, track: ScuffedCloudAPI.Track) {
    let optimal = ALIGNMENT_TEST[track.user.username.toLowerCase()]
    if( optimal === undefined ) return;
    if( optimal.some( (test) => track.title.toLowerCase().includes(test) ) ) {
        console.log(`HIT! ${user.username}`)
        SCORE++;
    }
    else{
        console.log(`Miss: ${user.username} (${track.title})`)
    }
}

// 0: Most "popular" track I've liked per artist
//     0.0: "popular" = soundcloud's metric (plays over time)
//     0.1: "popular" = likes over time
//     0.2: "popular" = likes squared over time
//     0.3: "popular" = comments over time
if( Math.floor(METRIC) === 0 ){

    const liked                 = await getLikedTracks();
    const direct_following_list = await getMyFollowings();
    
    const now = Date.now();

    const popularityFuncs: {[key: number]: (a: SoundcloudLikedTrack) => number} = {
        0.0: (it) => { return it.track.playback_count / (now - new Date( it.track.created_at ).getTime()) },
        0.1: (it) => { return it.track.likes_count / (now - new Date( it.track.created_at ).getTime()) },
        0.2: (it) => { return it.track.likes_count ** 2 / (now - new Date( it.track.created_at ).getTime()) },
        0.3: (it) => { return it.track.comment_count ** 2 / (now - new Date( it.track.created_at ).getTime()) },
    }

    let popularity = new LookupCache<SoundcloudLikedTrack, number>( popularityFuncs[METRIC] );
    
    const popularLikesPerArtist = new AutoMap<number, SoundcloudLikedTrack[]>( () => [] );
    for( let like of liked ){
        // console.log(like.track.user)
        const artist = like.track.user.id;
        popularLikesPerArtist.get(artist).push(like);
    }
    for( let [id, artistHits] of popularLikesPerArtist ){
        artistHits.sort( (a, b) => popularity.get(b) - popularity.get(a) );
    }
    
    console.log( popularLikesPerArtist.get(71428407).map( it => it.track.title ) );
    
    for( let artist of direct_following_list ){
        const likes = popularLikesPerArtist.get(artist.id);
        if( likes.length > 0 ){
            const summaryTrack = likes[0].track;
            checkPassedTest(artist, summaryTrack);
        }
    }
}

console.log(`Score = ${SCORE}`)