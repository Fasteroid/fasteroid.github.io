import { getLikes } from './api';
import { FASTEROID_ID } from './constants';
import type { SoundcloudLikedTrack } from '../../../lib/soundcloud/types_native';

export async function getLikedTracks(): Promise<SoundcloudLikedTrack[]> {
    return (await getLikes(FASTEROID_ID)).filter(like => like.track !== undefined) as SoundcloudLikedTrack[]
}
