import type { TrackSummary, AlbumSummary } from "../types";

interface AlbumAccumulator {
  id: string;
  name: string;
  artistNames: string[];
  imageUrl: string | null;
  spotifyUrl: string;
  count: number;
}

export function extractTopAlbumsFromTracks(
  tracks: TrackSummary[]
): AlbumSummary[] {
  const albumMap = new Map<string, AlbumAccumulator>();

  for (const track of tracks) {
    const existing = albumMap.get(track.albumId);
    if (existing) {
      existing.count++;
    } else {
      albumMap.set(track.albumId, {
        id: track.albumId,
        name: track.albumName,
        artistNames: track.artistNames,
        imageUrl: track.albumImageUrl,
        spotifyUrl: track.albumSpotifyUrl,
        count: 1,
      });
    }
  }

  // Convert to array and sort by count (descending)
  return Array.from(albumMap.values())
    .sort((a, b) => b.count - a.count)
    .map((album) => ({
      id: album.id,
      name: album.name,
      artistNames: album.artistNames,
      imageUrl: album.imageUrl,
      spotifyUrl: album.spotifyUrl,
      trackCount: album.count,
    }));
}
