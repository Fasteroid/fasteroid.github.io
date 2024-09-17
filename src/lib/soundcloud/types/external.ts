export namespace ScuffedCloudAPI {
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
        visuals:               Visuals;
        creator_subscriptions: CreatorSubscription[];
        creator_subscription:  CreatorSubscription;
        badges:                Badges;
        
        verified:              boolean;
        
        avatar_url:            string;
        city:                  string;
        country_code:          string;
        created_at:            string;
        description:           string;
        first_name:            string;
        full_name:             string;
        kind:                  "user";
        last_modified:         string;
        last_name:             string;
        permalink:             string;
        permalink_url:         string;
        uri:                   string;
        urn:                   string;
        username:              string;
        station_urn:           string;
        station_permalink:     string;
        
        reposts_count:         null;
        
        track_count:           number;
        playlist_count:        number;
        likes_count:           number;
        playlist_likes_count:  number;
        groups_count:          number;
        id:                    number;
        comments_count:        number;
        followers_count:       number;
        followings_count:      number;
    }

    export interface Track {
        id: number;
        kind: string;
        created_at: string;
        last_modified: string;
        permalink: string;
        permalink_url: string;
        title: string;
        duration: number;
        description: string;
        genre: string;
        tag_list: string;
        label_name: string | null;
        release_date: string | null;
        streamable: boolean;
        downloadable: boolean;
        license: string;
        track_type: string | null;
        uri: string;
        urn: string;
        artwork_url: string | null;
        waveform_url: string;
        user: User;
        likes_count: number;
        playback_count: number;
        comment_count: number;
        download_count: number;
        favoritings_count?: number;
        reposts_count: number;
        purchase_title: string | null;
        purchase_url: string | null;
        publisher_metadata: PublisherMetadata;
        monetization_model: string;
        policy: string;
        user_id: number;
        full_duration: number;
        has_downloads_left: boolean;
        secret_token: string | null;
        station_urn: string;
        station_permalink: string;
        track_authorization: string;
        commentable: boolean;
        public: boolean;
        visuals: null;
        state: string;
        display_date: string;
        embeddable_by: string;
        sharing: string;
        caption: string | null;
        media: {
            transcodings: Transcoding[];
        };
    }

    export interface PublisherMetadata {
        id: number;
        urn: string;
        artist?: string;
        album_title?: string;
        contains_music?: boolean;
        writer_composer?: string;
    }
    
    export interface Transcoding {
        url: string;
        preset: string;
        duration: number;
        snipped: boolean;
        format: {
            protocol: string;
            mime_type: string;
        };
        quality: string;
    }
}

