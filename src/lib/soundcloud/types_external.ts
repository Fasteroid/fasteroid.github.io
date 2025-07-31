export namespace ScuffedCloudAPI {
    
    export interface CreatorSubscription {
        product: {
            id: string;
        };
    }
    
    export interface Visuals {
        visuals:  {
            entry_time: number;
            
            visual_url: string;
            urn:        string;
        }[];
        
        enabled:  boolean;
        
        urn:      string;
        
        tracking: string | null;
    }
    
    export interface Badges {
        pro:              boolean;
        creator_mid_tier: boolean;
        pro_unlimited:    boolean;
        verified:         boolean;
    }
    
    export interface PartialUser {
        kind: "user"

        badges:            Badges

        id:                number
        followers_count:   number

        verified:          boolean

        first_name:        string
        full_name:         string
        last_modified:     string
        last_name:         string
        permalink:         string
        permalink_url:     string
        uri:               string
        urn:               string
        username:          string
        city:              string
        station_urn:       string
        station_permalink: string
        avatar_url:        string | null
        country_code:      string | null
    }

    export interface User extends PartialUser {
        visuals:               Visuals | null;
        creator_subscriptions: CreatorSubscription[];
        creator_subscription:  CreatorSubscription;

        track_count:           number;
        playlist_count:        number;
        likes_count:           number;
        playlist_likes_count:  number;
        groups_count:          number;
        comments_count:        number;
        followings_count:      number;
        
        created_at:            string;
        description:           string;
    }
    
    export interface PartialTrack {
        kind:               "track"

        id:                 number
        
        monetization_model: string
        policy:             string
    }

    export interface Track extends PartialTrack {
        publisher_metadata:   PublisherMetadata;
        user:                 PartialUser;
        visuals:              Visuals | null;
        
        media: {
            transcodings: Transcoding[];
        };
        
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
    
    export interface Playlist {
        kind: "playlist"

        user:              User
        tracks:            (Partial<Track> & PartialTrack)[]

        artwork_url:       string | null
        purchase_title:    string | null
        purchase_url:      string | null
        release_date:      string | null
        secret_token:      string | null
        created_at:        string
        description:       string
        duration:          number
        embeddable_by:     string
        genre:             string
        label_name:        string
        last_modified:     string
        license:           string
        likes_count:       number
        managed_by_feeds:  boolean
        permalink:         string
        permalink_url:     string
        public:            boolean
        reposts_count:     number
        sharing:           string
        tag_list:          string
        title:             string
        uri:               string
        user_id:           number
        set_type:          string
        is_album:          boolean
        published_at:      string
        display_date:      string
        track_count:       number
    }
    
    export interface PublisherMetadata {
        id:                   number

        contains_music:       boolean
        explicit?:            boolean

        urn:                  string
        artist?:              string
        album_title?:         string
        isrc?:                string
        writer_composer?:     string
        publisher?:           string
        p_line?:              string
        p_line_for_display?:  string
        release_title?:       string
    }
    
}

