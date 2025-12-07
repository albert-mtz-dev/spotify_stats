// Spotify API types
export interface SpotifyArtist {
  id: string;
  name: string;
  images: { url: string; width: number; height: number }[];
  genres: string[];
  popularity: number;
  external_urls: { spotify: string };
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { id: string; name: string }[];
  album: {
    id: string;
    name: string;
    images: { url: string; width: number; height: number }[];
    external_urls: { spotify: string };
    release_date: string;
  };
  duration_ms: number;
  popularity: number;
  external_urls: { spotify: string };
}

export interface SpotifyRecentlyPlayed {
  track: SpotifyTrack;
  played_at: string;
}

// Audio Features from Spotify API
export interface SpotifyAudioFeatures {
  id: string;
  danceability: number; // 0-1
  energy: number; // 0-1
  valence: number; // 0-1 (happiness/positivity)
  tempo: number; // BPM
  acousticness: number; // 0-1
  instrumentalness: number; // 0-1
  liveness: number; // 0-1
  speechiness: number; // 0-1
  loudness: number; // dB
  mode: number; // 0 = minor, 1 = major
  key: number; // 0-11 (C, C#, D, etc.)
}

// Extended stats for dashboard
export interface ExtendedStats {
  // Basic stats (no extra API calls)
  mainstreamScore: number; // 0-100, based on track popularity
  avgSongLengthMs: number;
  genreDiversity: number; // count of unique genres
  peakListeningHour: number; // 0-23
  mostActiveDay: string; // "Monday", "Tuesday", etc.

  // Audio feature stats
  energyScore: number; // 0-100
  danceabilityScore: number; // 0-100
  moodScore: number; // 0-100 (valence)
  acousticScore: number; // 0-100
  avgTempo: number; // BPM
  hasAudioFeatures: boolean; // Whether audio features were available

  // Derived/fun stats
  loyaltyScore: number; // 0-100, overlap between time ranges
  discoveryRate: number; // percentage of new artists
  albumExplorerScore: number; // unique albums vs tracks ratio
  decadeBreakdown: { decade: string; percentage: number }[];
}

// Dashboard summary types
export interface ArtistSummary {
  id: string;
  name: string;
  imageUrl: string | null;
  genres: string[];
  popularity: number;
  spotifyUrl: string;
}

export interface TrackSummary {
  id: string;
  name: string;
  artistNames: string[];
  albumName: string;
  albumImageUrl: string | null;
  albumId: string;
  albumSpotifyUrl: string;
  durationMs: number;
  popularity: number;
  releaseDate?: string;
  spotifyUrl: string;
}

export interface AlbumSummary {
  id: string;
  name: string;
  artistNames: string[];
  imageUrl: string | null;
  spotifyUrl: string;
  trackCount: number; // Number of tracks from this album in user's top tracks
}

export interface GenreStat {
  genre: string;
  count: number;
  percentage: number;
}

export interface ListeningPattern {
  hour: number;
  dayOfWeek: number;
  count: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date | null;
}

export interface DashboardData {
  user: {
    name: string;
    email: string;
    image: string | null;
  };
  stats: {
    totalListeningTimeMs: number;
    uniqueArtists: number;
    uniqueTracks: number;
    topGenre: string | null;
  };
  extendedStats: ExtendedStats;
  topArtists: {
    shortTerm: ArtistSummary[];
    mediumTerm: ArtistSummary[];
    longTerm: ArtistSummary[];
  };
  topTracks: {
    shortTerm: TrackSummary[];
    mediumTerm: TrackSummary[];
    longTerm: TrackSummary[];
  };
  topAlbums: {
    shortTerm: AlbumSummary[];
    mediumTerm: AlbumSummary[];
    longTerm: AlbumSummary[];
  };
  genres: GenreStat[];
  listeningPatterns: ListeningPattern[];
  badges: Badge[];
  lastSyncedAt: Date | null;
}

export type TimeRange = "short_term" | "medium_term" | "long_term";

export const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  short_term: "Last 4 Weeks",
  medium_term: "Last 6 Months",
  long_term: "All Time",
};

// Social / Public Profile types
export type ProfileVisibility = "PUBLIC" | "FOLLOWERS" | "PRIVATE";

export interface PrivacySettings {
  shareTopArtists: boolean;
  shareTopTracks: boolean;
  shareGenres: boolean;
  shareAudioProfile: boolean;
  shareBadges: boolean;
  shareListeningStats: boolean;
  sharePatterns: boolean;
  shareRecentlyPlayed: boolean;
  allowComparison: boolean;
}

export interface UserSettings {
  username: string | null;
  bio: string | null;
  profileVisibility: ProfileVisibility;
  hasCompletedOnboarding: boolean;
  privacy: PrivacySettings;
}

export interface PublicProfileUser {
  id: string;
  name: string;
  username: string | null;
  image: string | null;
  bio: string | null;
  lastSyncedAt: Date | null;
  followerCount: number;
  followingCount: number;
}

export interface PublicProfileData {
  user: PublicProfileUser;
  stats: {
    topArtists: ArtistSummary[];
    topTracks: TrackSummary[];
    topGenres: string[];
    badges: Badge[];
    listeningStats?: {
      totalListeningTimeMs: number;
      uniqueArtists: number;
      uniqueTracks: number;
    };
    extendedStats?: ExtendedStats;
    listeningPatterns?: ListeningPattern[];
  };
  // Viewer-specific data
  viewerRelationship: {
    isFollowing: boolean;
    isFollowedBy: boolean;
    hasPendingRequest: boolean;
    canView: boolean;
  };
  compatibility?: CompatibilityData;
}

export interface CompatibilityData {
  score: number; // 0-100
  sharedArtists: ArtistSummary[];
  sharedGenres: string[];
  comparisonStats: {
    label: string;
    viewerValue: number;
    profileValue: number;
  }[];
}

export interface UserSearchResult {
  id: string;
  name: string;
  username: string | null;
  image: string | null;
  bio: string | null;
  isFollowing?: boolean;
}

// Follow types
export type FollowRequestStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export interface FollowRequest {
  id: string;
  fromUser: {
    id: string;
    name: string;
    username: string | null;
    image: string | null;
  };
  status: FollowRequestStatus;
  createdAt: Date;
}

export interface FollowerUser {
  id: string;
  name: string;
  username: string | null;
  image: string | null;
  bio: string | null;
  followedAt: Date;
}
