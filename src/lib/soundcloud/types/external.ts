interface CreatorSubscriptionProduct {
    id: string;
}
  
interface CreatorSubscription {
    product: CreatorSubscriptionProduct;
}
  
interface Visual {
    urn:        string;
    entry_time: number;
    visual_url: string;
}
  
interface Visuals {
    urn:      string;
    enabled:  boolean;
    visuals:  Visual[];
    tracking: null; // seems to be always null
}
  
interface Badges {
    pro:              boolean;
    creator_mid_tier: boolean;
    pro_unlimited:    boolean;
    verified:         boolean;
}
  
interface SoundcloudUser {
    avatar_url:            string;
    city:                  string;
    comments_count:        number;
    country_code:          string;
    created_at:            string;
    creator_subscriptions: CreatorSubscription[];
    creator_subscription:  CreatorSubscription;
    description:           string;
    followers_count:       number;
    followings_count:      number;
    first_name:            string;
    full_name:             string;
    groups_count:          number;
    id:                    number;
    kind:                  "user";
    last_modified:         string;
    last_name:             string;
    likes_count:           number;
    playlist_likes_count:  number;
    permalink:             string;
    permalink_url:         string;
    playlist_count:        number;
    reposts_count:         null;
    track_count:           number;
    uri:                   string;
    urn:                   string;
    username:              string;
    verified:              boolean;
    visuals:               Visuals;
    badges:                Badges;
    station_urn:           string;
    station_permalink:     string;
}