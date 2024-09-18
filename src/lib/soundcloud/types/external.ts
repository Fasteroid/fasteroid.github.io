export namespace ScuffedCloudAPI {
    
    export interface CreatorSubscription {
        product: {
            id: string;
        };
    }
    
    export interface Visual {
        entry_time: number;

        visual_url: string;
        urn:        string;
    }
    
    export interface Visuals {
        visuals:  Visual[];

        enabled:  boolean;

        urn:      string;

        tracking: null; // seems to be always null
    }
    
    export interface Badges {
        pro:              boolean;
        creator_mid_tier: boolean;
        pro_unlimited:    boolean;
        verified:         boolean;
    }
    
    export interface User {
        kind:                  "user";

        visuals:               Visuals | null;
        creator_subscriptions: CreatorSubscription[];
        creator_subscription:  CreatorSubscription;
        badges:                Badges;

        id:                    number;
        track_count:           number;
        playlist_count:        number;
        likes_count:           number;
        playlist_likes_count:  number;
        groups_count:          number;
        comments_count:        number;
        followers_count:       number;
        followings_count:      number;
        
        verified:              boolean;
        
        avatar_url:            string | null;
        city:                  string;
        country_code:          string;
        created_at:            string;
        description:           string;
        first_name:            string;
        full_name:             string;
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
    }

    // subset of user returned on tracks
    export interface TrackAuthor {
        kind:                  "user";

        badges:                Badges;

        id:                    number;
        followers_count:       number;

        verified:              boolean

        avatar_url:            string | null;
        full_name:             string;
        last_modified:         string;
        last_name:             string;
        permalink:             string;
        permalink_url:         string;
        uri:                   string;
        urn:                   string;
        username:              string;
        city:                  string;
        country_code:          string;
        station_urn:           string;
        station_permalink:     string;
    }

    export interface Track {
        kind:                 "track";

        publisher_metadata:   PublisherMetadata;
        user:                 TrackAuthor;
        visuals:              Visuals | null;

        media: {
            transcodings: Transcoding[];
        };

        id:                   number;
        duration:             number;
        likes_count:          number;
        playback_count:       number;
        comment_count:        number;
        download_count:       number;
        reposts_count:        number;
        user_id:              number;
        full_duration:        number;

        streamable:           boolean;
        downloadable:         boolean;
        has_downloads_left:   boolean;
        commentable:          boolean;
        public:               boolean;

        created_at:           string;
        last_modified:        string;
        permalink:            string;
        permalink_url:        string;
        title:                string;
        description:          string;
        genre:                string;
        tag_list:             string;
        license:              string;
        uri:                  string;
        urn:                  string;
        waveform_url:         string;
        monetization_model:   string;
        policy:               string;
        station_urn:          string;
        station_permalink:    string;
        track_authorization:  string;
        state:                string;
        display_date:         string;
        embeddable_by:        string;
        sharing:              string;
        label_name:           string | null;
        release_date:         string | null;
        artwork_url:          string | null;
        purchase_title:       string | null;
        purchase_url:         string | null;
    }

    export interface Like {
        kind:                 "like";

        created_at:           string;
        
        track?:               Track;
        // playlist?:         Playlist; // todo if needed; does exist but I'm not interested in them right now
    }

    export interface PublisherMetadata {
        id:               number;

        contains_music?:  boolean;

        urn:              string;
        artist?:          string;
        album_title?:     string;
        writer_composer?: string;
    }
    
    export interface Transcoding {
        format: {
            protocol: string;
            mime_type: string;
        };

        duration: number;

        snipped:  boolean;

        url:      string;
        preset:   string;
        quality:  string;
    }
}

