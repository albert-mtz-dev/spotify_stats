import { prisma } from "./prisma";
import type { ArtistSummary, TrackSummary, TimeRange } from "./types";

const SPOTIFY_API_BASE = "https://api.spotify.com/v1";
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

interface SpotifyArtist {
  id: string;
  name: string;
  images: { url: string }[];
  genres: string[];
  popularity: number;
  external_urls: { spotify: string };
}

interface SpotifyTrack {
  id: string;
  name: string;
  artists: { id: string; name: string }[];
  album: {
    id: string;
    name: string;
    images: { url: string }[];
    external_urls: { spotify: string };
    release_date: string;
  };
  duration_ms: number;
  popularity: number;
  external_urls: { spotify: string };
}

/**
 * Refresh a Spotify access token using the refresh token
 */
export async function refreshSpotifyToken(
  refreshToken: string
): Promise<SpotifyTokenResponse | null> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error("Missing Spotify credentials");
    return null;
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  try {
    const response = await fetch(SPOTIFY_TOKEN_URL, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Token refresh failed:", error);
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("Token refresh error:", error);
    return null;
  }
}

/**
 * Get a valid access token for a user, refreshing if necessary
 */
export async function getValidAccessToken(userId: string): Promise<string | null> {
  const account = await prisma.account.findFirst({
    where: {
      userId,
      provider: "spotify",
    },
  });

  if (!account || !account.refresh_token) {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  const expiresAt = account.expires_at || 0;

  // If token is still valid (with 5 minute buffer), return it
  if (account.access_token && expiresAt > now + 300) {
    return account.access_token;
  }

  // Token expired or expiring soon, refresh it
  const newTokens = await refreshSpotifyToken(account.refresh_token);

  if (!newTokens) {
    return null;
  }

  // Update the account with new tokens
  await prisma.account.update({
    where: { id: account.id },
    data: {
      access_token: newTokens.access_token,
      expires_at: Math.floor(Date.now() / 1000) + newTokens.expires_in,
      // Spotify may return a new refresh token
      ...(newTokens.refresh_token && { refresh_token: newTokens.refresh_token }),
    },
  });

  return newTokens.access_token;
}

/**
 * Fetch data from Spotify API
 */
async function spotifyFetch<T>(endpoint: string, accessToken: string): Promise<T | null> {
  try {
    const response = await fetch(`${SPOTIFY_API_BASE}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.error(`Spotify API error: ${response.status}`);
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("Spotify fetch error:", error);
    return null;
  }
}

/**
 * Fetch and transform top artists
 */
async function fetchTopArtists(
  accessToken: string,
  timeRange: TimeRange
): Promise<ArtistSummary[]> {
  const data = await spotifyFetch<{ items: SpotifyArtist[] }>(
    `/me/top/artists?time_range=${timeRange}&limit=50`,
    accessToken
  );

  if (!data) return [];

  return data.items.map((artist) => ({
    id: artist.id,
    name: artist.name,
    imageUrl: artist.images[0]?.url ?? null,
    genres: artist.genres,
    popularity: artist.popularity,
    spotifyUrl: artist.external_urls.spotify,
  }));
}

/**
 * Fetch and transform top tracks
 */
async function fetchTopTracks(
  accessToken: string,
  timeRange: TimeRange
): Promise<TrackSummary[]> {
  const data = await spotifyFetch<{ items: SpotifyTrack[] }>(
    `/me/top/tracks?time_range=${timeRange}&limit=50`,
    accessToken
  );

  if (!data) return [];

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

/**
 * Sync a single user's Spotify data
 */
export async function syncUserData(userId: string): Promise<boolean> {
  const accessToken = await getValidAccessToken(userId);

  if (!accessToken) {
    console.log(`No valid token for user ${userId}`);
    return false;
  }

  try {
    const timeRanges: TimeRange[] = ["short_term", "medium_term", "long_term"];

    // Fetch all data in parallel
    const [
      shortTermArtists,
      mediumTermArtists,
      longTermArtists,
      shortTermTracks,
      mediumTermTracks,
      longTermTracks,
    ] = await Promise.all([
      fetchTopArtists(accessToken, "short_term"),
      fetchTopArtists(accessToken, "medium_term"),
      fetchTopArtists(accessToken, "long_term"),
      fetchTopTracks(accessToken, "short_term"),
      fetchTopTracks(accessToken, "medium_term"),
      fetchTopTracks(accessToken, "long_term"),
    ]);

    const artistData = [shortTermArtists, mediumTermArtists, longTermArtists];
    const trackData = [shortTermTracks, mediumTermTracks, longTermTracks];

    // Save to database
    for (let i = 0; i < timeRanges.length; i++) {
      await prisma.spotifySnapshot.upsert({
        where: { id: `${userId}-artists-${timeRanges[i]}` },
        update: {
          data: JSON.parse(JSON.stringify(artistData[i])),
          createdAt: new Date(),
        },
        create: {
          id: `${userId}-artists-${timeRanges[i]}`,
          userId,
          timeRange: timeRanges[i],
          type: "artists",
          data: JSON.parse(JSON.stringify(artistData[i])),
        },
      });

      await prisma.spotifySnapshot.upsert({
        where: { id: `${userId}-tracks-${timeRanges[i]}` },
        update: {
          data: JSON.parse(JSON.stringify(trackData[i])),
          createdAt: new Date(),
        },
        create: {
          id: `${userId}-tracks-${timeRanges[i]}`,
          userId,
          timeRange: timeRanges[i],
          type: "tracks",
          data: JSON.parse(JSON.stringify(trackData[i])),
        },
      });
    }

    // Update lastSyncedAt
    await prisma.user.update({
      where: { id: userId },
      data: { lastSyncedAt: new Date() },
    });

    return true;
  } catch (error) {
    console.error(`Sync error for user ${userId}:`, error);
    return false;
  }
}

/**
 * Get users that need syncing (haven't synced in specified hours)
 */
export async function getUsersNeedingSync(hoursOld: number = 24): Promise<string[]> {
  const cutoffDate = new Date(Date.now() - hoursOld * 60 * 60 * 1000);

  const users = await prisma.user.findMany({
    where: {
      accounts: {
        some: {
          provider: "spotify",
          refresh_token: { not: null },
        },
      },
      OR: [
        { lastSyncedAt: null },
        { lastSyncedAt: { lt: cutoffDate } },
      ],
    },
    select: { id: true },
    take: 50, // Limit batch size to avoid timeout
  });

  return users.map((u) => u.id);
}

/**
 * Run batch sync for all users needing updates
 */
export async function runBatchSync(hoursOld: number = 24): Promise<{
  total: number;
  successful: number;
  failed: number;
}> {
  const userIds = await getUsersNeedingSync(hoursOld);

  let successful = 0;
  let failed = 0;

  for (const userId of userIds) {
    const success = await syncUserData(userId);
    if (success) {
      successful++;
    } else {
      failed++;
    }

    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return {
    total: userIds.length,
    successful,
    failed,
  };
}
