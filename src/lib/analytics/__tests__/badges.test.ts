import { describe, it, expect } from "vitest";
import { assignBadges, type BadgeContext } from "../badges";

describe("assignBadges", () => {
  it("should assign explorer badge for 50+ unique artists", () => {
    const context: BadgeContext = {
      topArtists: [],
      genres: [],
      uniqueArtistsCount: 50,
      uniqueTracksCount: 0,
      totalListeningTimeMs: 0,
    };

    const badges = assignBadges(context);
    expect(badges.some((b) => b.id === "explorer")).toBe(true);
  });

  it("should assign diverse badge for 10+ genres", () => {
    const genres = Array.from({ length: 10 }, (_, i) => ({
      genre: `genre${i}`,
      count: 1,
      percentage: 10,
    }));

    const context: BadgeContext = {
      topArtists: [],
      genres,
      uniqueArtistsCount: 0,
      uniqueTracksCount: 0,
      totalListeningTimeMs: 0,
    };

    const badges = assignBadges(context);
    expect(badges.some((b) => b.id === "diverse")).toBe(true);
  });

  it("should assign dedicated badge for 10+ hours listening", () => {
    const context: BadgeContext = {
      topArtists: [],
      genres: [],
      uniqueArtistsCount: 0,
      uniqueTracksCount: 0,
      totalListeningTimeMs: 10 * 60 * 60 * 1000, // 10 hours
    };

    const badges = assignBadges(context);
    expect(badges.some((b) => b.id === "dedicated")).toBe(true);
  });

  it("should assign mainstream badge for high popularity top artist", () => {
    const context: BadgeContext = {
      topArtists: [
        {
          id: "1",
          name: "Popular Artist",
          imageUrl: null,
          genres: [],
          popularity: 85,
          spotifyUrl: "",
        },
      ],
      genres: [],
      uniqueArtistsCount: 0,
      uniqueTracksCount: 0,
      totalListeningTimeMs: 0,
    };

    const badges = assignBadges(context);
    expect(badges.some((b) => b.id === "mainstream")).toBe(true);
  });

  it("should assign underground badge for low popularity artist in top 10", () => {
    const context: BadgeContext = {
      topArtists: [
        {
          id: "1",
          name: "Underground Artist",
          imageUrl: null,
          genres: [],
          popularity: 30,
          spotifyUrl: "",
        },
      ],
      genres: [],
      uniqueArtistsCount: 0,
      uniqueTracksCount: 0,
      totalListeningTimeMs: 0,
    };

    const badges = assignBadges(context);
    expect(badges.some((b) => b.id === "underground")).toBe(true);
  });

  it("should not assign badges when conditions are not met", () => {
    const context: BadgeContext = {
      topArtists: [
        {
          id: "1",
          name: "Artist",
          imageUrl: null,
          genres: [],
          popularity: 50,
          spotifyUrl: "",
        },
      ],
      genres: [{ genre: "pop", count: 1, percentage: 100 }],
      uniqueArtistsCount: 10,
      uniqueTracksCount: 10,
      totalListeningTimeMs: 1000,
    };

    const badges = assignBadges(context);
    expect(badges).toHaveLength(0);
  });
});
