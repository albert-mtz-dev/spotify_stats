import type { ArtistSummary, GenreStat } from "../types";

export function aggregateGenresFromArtists(artists: ArtistSummary[]): GenreStat[] {
  const genreCounts = new Map<string, number>();

  for (const artist of artists) {
    for (const genre of artist.genres) {
      genreCounts.set(genre, (genreCounts.get(genre) || 0) + 1);
    }
  }

  const total = Array.from(genreCounts.values()).reduce((a, b) => a + b, 0);

  const genres = Array.from(genreCounts.entries())
    .map(([genre, count]) => ({
      genre,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  return genres;
}

export function getTopGenres(genres: GenreStat[], limit: number = 10): GenreStat[] {
  return genres.slice(0, limit);
}
