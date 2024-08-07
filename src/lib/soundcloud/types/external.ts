export interface CreatorSubscriptionProduct {
    id: string;
}
  
export interface CreatorSubscription {
    product: CreatorSubscriptionProduct;
}
  
export interface Visual {
    urn:        string;
    entry_time: number;
    visual_url: string;
}
  
export interface Visuals {
    urn:      string;
    enabled:  boolean;
    visuals:  Visual[];
    tracking: null; // seems to be always null
}
  
export interface Badges {
    pro:              boolean;
    creator_mid_tier: boolean;
    pro_unlimited:    boolean;
    verified:         boolean;
}

export interface User {
    id:          number;
    username:    string;
    avatar_url:  string;
    permalink_url:   string;
    description: string;
}
  
export interface FullUser extends User {
    visuals:               Visuals;
    creator_subscriptions: CreatorSubscription[];
    creator_subscription:  CreatorSubscription;
    badges:                Badges;

    verified:              boolean;

    // avatar_url:            string;
    city:                  string;
    country_code:          string;
    created_at:            string;
    // description:           string;
    first_name:            string;
    full_name:             string;
    kind:                  "user";
    last_modified:         string;
    last_name:             string;
    // permalink:             string;
    permalink_url:         string;
    uri:                   string;
    urn:                   string;
    // username:              string;
    station_urn:           string;
    station_permalink:     string;

    reposts_count:         null;

    track_count:           number;
    playlist_count:        number;
    likes_count:           number;
    playlist_likes_count:  number;
    groups_count:          number;
    // id:                    number;
    comments_count:        number;
    followers_count:       number;
    followings_count:      number;
}

export interface FullUserCollection {
    collection: FullUser[];
}