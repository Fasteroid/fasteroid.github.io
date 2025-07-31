import { getFollowings } from './api';
import { FASTEROID_ID } from './constants';
import type { ScuffedCloudAPI } from '../../../lib/soundcloud/types_external';

export async function getMyFollowings(): Promise<ScuffedCloudAPI.User[]> {
    return await getFollowings(FASTEROID_ID)
}

