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
  };
  duration_ms: number;
  popularity: number;
  external_urls: { spotify: string };
}

export interface SpotifyRecentlyPlayed {
  track: SpotifyTrack;
  played_at: string;
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
export type ProfileVisibility = "PUBLIC" | "PRIVATE";

export interface UserSettings {
  username: string | null;
  bio: string | null;
  profileVisibility: ProfileVisibility;
  hasSeenVisibilityNotice: boolean;
}

export interface PublicProfileUser {
  id: string;
  name: string;
  username: string | null;
  image: string | null;
  bio: string | null;
  lastSyncedAt: Date | null;
}

export interface PublicProfileData {
  user: PublicProfileUser;
  stats: {
    topArtists: ArtistSummary[];
    topTracks: TrackSummary[];
    topGenres: string[];
    badges: Badge[];
  };
}

export interface UserSearchResult {
  id: string;
  name: string;
  username: string | null;
  image: string | null;
  bio: string | null;
}
