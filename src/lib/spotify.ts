import { auth } from "./auth";
import type {
  SpotifyArtist,
  SpotifyTrack,
  SpotifyRecentlyPlayed,
  SpotifyAudioFeatures,
  TimeRange,
  ArtistSummary,
  TrackSummary,
} from "./types";

const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

export async function getAccessToken(): Promise<string | null> {
  const session = await auth();
  return session?.accessToken ?? null;
}

async function spotifyFetch<T>(
  endpoint: string,
  accessToken: string
): Promise<T> {
  const response = await fetch(`${SPOTIFY_API_BASE}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    next: { revalidate: 300 }, // Cache for 5 minutes
  });

  if (!response.ok) {
    throw new Error(`Spotify API error: ${response.status}`);
  }

  return response.json();
}

export async function getTopArtists(
  accessToken: string,
  timeRange: TimeRange = "medium_term",
  limit: number = 20
): Promise<ArtistSummary[]> {
  const data = await spotifyFetch<{ items: SpotifyArtist[] }>(
    `/me/top/artists?time_range=${timeRange}&limit=${limit}`,
    accessToken
  );

  return data.items.map((artist) => ({
    id: artist.id,
    name: artist.name,
    imageUrl: artist.images[0]?.url ?? null,
    genres: artist.genres,
    popularity: artist.popularity,
    spotifyUrl: artist.external_urls.spotify,
  }));
}

export async function getTopTracks(
  accessToken: string,
  timeRange: TimeRange = "medium_term",
  limit: number = 20
): Promise<TrackSummary[]> {
  const data = await spotifyFetch<{ items: SpotifyTrack[] }>(
    `/me/top/tracks?time_range=${timeRange}&limit=${limit}`,
    accessToken
  );

  return data.items.map((track) => ({
    id: track.id,
    name: track.name,
    artistNames: track.artists.map((a) => a.name),
    albumName: track.album.name,
    albumImageUrl: track.album.images[0]?.url ?? null,
    albumId: track.album.id,
    albumSpotifyUrl: track.album.external_urls.spotify,
    durationMs: track.duration_ms,
    popularity: track.popularity,
    releaseDate: track.album.release_date,
    spotifyUrl: track.external_urls.spotify,
  }));
}

export async function getRecentlyPlayed(
  accessToken: string,
  limit: number = 50
): Promise<SpotifyRecentlyPlayed[]> {
  const data = await spotifyFetch<{ items: SpotifyRecentlyPlayed[] }>(
    `/me/player/recently-played?limit=${limit}`,
    accessToken
  );

  return data.items;
}

export async function getCurrentUser(accessToken: string) {
  return spotifyFetch<{
    id: string;
    display_name: string;
    email: string;
    images: { url: string }[];
  }>("/me", accessToken);
}

// Get audio features for multiple tracks (max 100 per request)
export async function getAudioFeatures(
  accessToken: string,
  trackIds: string[]
): Promise<SpotifyAudioFeatures[]> {
  if (trackIds.length === 0) return [];

  // Spotify API allows max 100 IDs per request
  const chunks: string[][] = [];
  for (let i = 0; i < trackIds.length; i += 100) {
    chunks.push(trackIds.slice(i, i + 100));
  }

  const results: SpotifyAudioFeatures[] = [];

  for (const chunk of chunks) {
    const data = await spotifyFetch<{ audio_features: (SpotifyAudioFeatures | null)[] }>(
      `/audio-features?ids=${chunk.join(",")}`,
      accessToken
    );
    // Filter out null values (tracks without audio features)
    results.push(...data.audio_features.filter((f): f is SpotifyAudioFeatures => f !== null));
  }

  return results;
}
