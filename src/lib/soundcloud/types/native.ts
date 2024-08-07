import type { User } from "./external";

export type UserFollowings = User & {
    following: User[]
}

export type FollowerMapNode = {
    id:       number;
    incoming: number[];
    outgoing: number[];
}

export type FollowerMap = {
    users: {[id: number]: User}
    nodes: {[id: number]: FollowerMapNode}
}