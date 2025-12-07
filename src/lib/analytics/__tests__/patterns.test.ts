import { describe, it, expect } from "vitest";
import {
  bucketPlaysByHourAndWeekday,
  calculateTotalListeningTime,
  formatDuration,
} from "../patterns";
import type { SpotifyRecentlyPlayed } from "../../types";

describe("bucketPlaysByHourAndWeekday", () => {
  it("should bucket plays by hour and day of week", () => {
    // Sunday at midnight (hour 0, day 0)
    const plays: SpotifyRecentlyPlayed[] = [
      {
        played_at: "2024-01-07T00:30:00Z", // Sunday midnight
        track: {
          id: "1",
          name: "Track 1",
          artists: [{ id: "a1", name: "Artist" }],
          album: { id: "al1", name: "Album", images: [] },
          duration_ms: 180000,
          popularity: 50,
          external_urls: { spotify: "" },
        },
      },
      {
        played_at: "2024-01-07T00:45:00Z", // Sunday midnight
        track: {
          id: "2",
          name: "Track 2",
          artists: [{ id: "a1", name: "Artist" }],
          album: { id: "al1", name: "Album", images: [] },
          duration_ms: 200000,
          popularity: 60,
          external_urls: { spotify: "" },
        },
      },
    ];

    const result = bucketPlaysByHourAndWeekday(plays);

    // Find Sunday hour 0
    const sundayMidnight = result.find(
      (p) => p.dayOfWeek === 0 && p.hour === 0
    );
    expect(sundayMidnight?.count).toBe(2);
  });

  it("should return all 168 hour/day combinations", () => {
    const result = bucketPlaysByHourAndWeekday([]);
    expect(result).toHaveLength(168); // 24 hours * 7 days
  });
});

describe("calculateTotalListeningTime", () => {
  it("should sum up all track durations", () => {
    const plays: SpotifyRecentlyPlayed[] = [
      {
        played_at: "2024-01-07T00:30:00Z",
        track: {
          id: "1",
          name: "Track 1",
          artists: [],
          album: { id: "al1", name: "Album", images: [] },
          duration_ms: 180000,
          popularity: 50,
          external_urls: { spotify: "" },
        },
      },
      {
        played_at: "2024-01-07T00:35:00Z",
        track: {
          id: "2",
          name: "Track 2",
          artists: [],
          album: { id: "al1", name: "Album", images: [] },
          duration_ms: 200000,
          popularity: 60,
          external_urls: { spotify: "" },
        },
      },
    ];

    const result = calculateTotalListeningTime(plays);
    expect(result).toBe(380000);
  });

  it("should return 0 for empty array", () => {
    const result = calculateTotalListeningTime([]);
    expect(result).toBe(0);
  });
});

describe("formatDuration", () => {
  it("should format hours and minutes", () => {
    expect(formatDuration(3600000)).toBe("1h 0m"); // 1 hour
    expect(formatDuration(5400000)).toBe("1h 30m"); // 1.5 hours
  });

  it("should format minutes only when less than an hour", () => {
    expect(formatDuration(60000)).toBe("1m");
    expect(formatDuration(180000)).toBe("3m");
  });

  it("should handle 0", () => {
    expect(formatDuration(0)).toBe("0m");
  });
});
