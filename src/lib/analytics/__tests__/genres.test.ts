import { describe, it, expect } from "vitest";
import { aggregateGenresFromArtists, getTopGenres } from "../genres";
import type { ArtistSummary } from "../../types";

describe("aggregateGenresFromArtists", () => {
  it("should aggregate genres from artists", () => {
    const artists: ArtistSummary[] = [
      {
        id: "1",
        name: "Artist 1",
        imageUrl: null,
        genres: ["pop", "rock"],
        popularity: 80,
        spotifyUrl: "https://open.spotify.com/artist/1",
      },
      {
        id: "2",
        name: "Artist 2",
        imageUrl: null,
        genres: ["pop", "indie"],
        popularity: 70,
        spotifyUrl: "https://open.spotify.com/artist/2",
      },
    ];

    const result = aggregateGenresFromArtists(artists);

    expect(result).toHaveLength(3);
    expect(result[0].genre).toBe("pop");
    expect(result[0].count).toBe(2);
    expect(result[1].count).toBe(1);
    expect(result[2].count).toBe(1);
  });

  it("should handle empty artists array", () => {
    const result = aggregateGenresFromArtists([]);
    expect(result).toHaveLength(0);
  });

  it("should handle artists with no genres", () => {
    const artists: ArtistSummary[] = [
      {
        id: "1",
        name: "Artist 1",
        imageUrl: null,
        genres: [],
        popularity: 80,
        spotifyUrl: "https://open.spotify.com/artist/1",
      },
    ];

    const result = aggregateGenresFromArtists(artists);
    expect(result).toHaveLength(0);
  });
});

describe("getTopGenres", () => {
  it("should return limited genres", () => {
    const genres = [
      { genre: "pop", count: 10, percentage: 50 },
      { genre: "rock", count: 5, percentage: 25 },
      { genre: "indie", count: 3, percentage: 15 },
      { genre: "electronic", count: 2, percentage: 10 },
    ];

    const result = getTopGenres(genres, 2);
    expect(result).toHaveLength(2);
    expect(result[0].genre).toBe("pop");
    expect(result[1].genre).toBe("rock");
  });
});
