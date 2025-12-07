import type { Badge, ArtistSummary, GenreStat } from "../types";

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  check: (context: BadgeContext) => boolean;
}

export interface BadgeContext {
  topArtists: ArtistSummary[];
  genres: GenreStat[];
  uniqueArtistsCount: number;
  uniqueTracksCount: number;
  totalListeningTimeMs: number;
}

const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: "explorer",
    name: "Music Explorer",
    description: "Listened to 50+ unique artists",
    icon: "compass",
    check: (ctx) => ctx.uniqueArtistsCount >= 50,
  },
  {
    id: "diverse",
    name: "Genre Hopper",
    description: "Your top artists span 10+ genres",
    icon: "shuffle",
    check: (ctx) => ctx.genres.length >= 10,
  },
  {
    id: "dedicated",
    name: "Dedicated Listener",
    description: "Over 10 hours of listening time",
    icon: "headphones",
    check: (ctx) => ctx.totalListeningTimeMs >= 10 * 60 * 60 * 1000,
  },
  {
    id: "mainstream",
    name: "Mainstream Maven",
    description: "Your top artist has 80+ popularity",
    icon: "trending-up",
    check: (ctx) => ctx.topArtists[0]?.popularity >= 80,
  },
  {
    id: "underground",
    name: "Underground Scout",
    description: "Found an artist with <40 popularity in your top 10",
    icon: "search",
    check: (ctx) =>
      ctx.topArtists.slice(0, 10).some((a) => a.popularity < 40),
  },
  {
    id: "loyal",
    name: "Loyal Fan",
    description: "Same #1 artist across all time ranges",
    icon: "heart",
    check: () => false, // Requires comparing across time ranges - simplified for now
  },
  {
    id: "collector",
    name: "Track Collector",
    description: "100+ unique tracks in your history",
    icon: "library",
    check: (ctx) => ctx.uniqueTracksCount >= 100,
  },
  {
    id: "pop_lover",
    name: "Pop Enthusiast",
    description: "Pop is in your top 3 genres",
    icon: "music",
    check: (ctx) =>
      ctx.genres.slice(0, 3).some((g) => g.genre.toLowerCase().includes("pop")),
  },
  {
    id: "rock_fan",
    name: "Rock Spirit",
    description: "Rock is in your top 3 genres",
    icon: "guitar",
    check: (ctx) =>
      ctx.genres.slice(0, 3).some((g) => g.genre.toLowerCase().includes("rock")),
  },
  {
    id: "hip_hop_head",
    name: "Hip Hop Head",
    description: "Hip hop or rap is in your top 3 genres",
    icon: "mic",
    check: (ctx) =>
      ctx.genres
        .slice(0, 3)
        .some(
          (g) =>
            g.genre.toLowerCase().includes("hip hop") ||
            g.genre.toLowerCase().includes("rap")
        ),
  },
];

export function assignBadges(context: BadgeContext): Badge[] {
  return BADGE_DEFINITIONS.filter((def) => def.check(context)).map((def) => ({
    id: def.id,
    name: def.name,
    description: def.description,
    icon: def.icon,
    earnedAt: new Date(),
  }));
}

export function getAllBadgeDefinitions(): Omit<BadgeDefinition, "check">[] {
  return BADGE_DEFINITIONS.map(({ check: _check, ...rest }) => rest);
}
