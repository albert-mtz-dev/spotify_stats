import type { ArtistSummary, CompatibilityData, ExtendedStats } from "../types";

interface UserMusicData {
  topArtists: ArtistSummary[];
  genres: string[];
  extendedStats?: ExtendedStats;
}

/**
 * Calculate music taste compatibility between two users.
 * Returns a score from 0-100 and shared data.
 */
export function calculateCompatibility(
  viewer: UserMusicData,
  profile: UserMusicData
): CompatibilityData {
  const sharedArtists = findSharedArtists(viewer.topArtists, profile.topArtists);
  const sharedGenres = findSharedGenres(viewer.genres, profile.genres);
  const comparisonStats = buildComparisonStats(viewer.extendedStats, profile.extendedStats);

  // Calculate component scores
  const artistScore = calculateArtistScore(sharedArtists, viewer.topArtists, profile.topArtists);
  const genreScore = calculateGenreScore(sharedGenres, viewer.genres, profile.genres);
  const profileScore = calculateProfileScore(viewer.extendedStats, profile.extendedStats);

  // Weighted average: artists 40%, genres 35%, audio profile 25%
  const weights = { artist: 0.4, genre: 0.35, profile: 0.25 };
  const score = Math.round(
    artistScore * weights.artist +
    genreScore * weights.genre +
    profileScore * weights.profile
  );

  return {
    score: Math.min(100, Math.max(0, score)),
    sharedArtists: sharedArtists.slice(0, 10), // Limit to top 10
    sharedGenres: sharedGenres.slice(0, 10),
    comparisonStats,
  };
}

/**
 * Find artists that both users have in their top lists.
 */
function findSharedArtists(
  viewerArtists: ArtistSummary[],
  profileArtists: ArtistSummary[]
): ArtistSummary[] {
  const profileArtistIds = new Set(profileArtists.map((a) => a.id));
  return viewerArtists.filter((a) => profileArtistIds.has(a.id));
}

/**
 * Find genres that both users share.
 */
function findSharedGenres(viewerGenres: string[], profileGenres: string[]): string[] {
  const profileGenreSet = new Set(profileGenres.map((g) => g.toLowerCase()));
  return viewerGenres.filter((g) => profileGenreSet.has(g.toLowerCase()));
}

/**
 * Calculate artist overlap score (0-100).
 * Uses Jaccard similarity with position weighting.
 */
function calculateArtistScore(
  shared: ArtistSummary[],
  viewerArtists: ArtistSummary[],
  profileArtists: ArtistSummary[]
): number {
  if (viewerArtists.length === 0 || profileArtists.length === 0) return 0;

  // Simple Jaccard similarity
  const union = new Set([
    ...viewerArtists.map((a) => a.id),
    ...profileArtists.map((a) => a.id),
  ]);
  const intersection = shared.length;

  const jaccard = (intersection / union.size) * 100;

  // Boost score if shared artists are high in both lists
  const positionBoost = calculatePositionBoost(shared, viewerArtists, profileArtists);

  return Math.min(100, jaccard * 2 + positionBoost);
}

/**
 * Calculate position boost for shared artists.
 * Higher boost if shared artists appear early in both lists.
 */
function calculatePositionBoost(
  shared: ArtistSummary[],
  viewerArtists: ArtistSummary[],
  profileArtists: ArtistSummary[]
): number {
  if (shared.length === 0) return 0;

  let boost = 0;
  const viewerPositions = new Map(viewerArtists.map((a, i) => [a.id, i]));
  const profilePositions = new Map(profileArtists.map((a, i) => [a.id, i]));

  for (const artist of shared) {
    const viewerPos = viewerPositions.get(artist.id) ?? viewerArtists.length;
    const profilePos = profilePositions.get(artist.id) ?? profileArtists.length;

    // Higher boost for artists in top 10 of both lists
    if (viewerPos < 10 && profilePos < 10) {
      boost += 5;
    } else if (viewerPos < 20 && profilePos < 20) {
      boost += 2;
    }
  }

  return Math.min(30, boost); // Cap at 30
}

/**
 * Calculate genre overlap score (0-100).
 */
function calculateGenreScore(
  shared: string[],
  viewerGenres: string[],
  profileGenres: string[]
): number {
  if (viewerGenres.length === 0 || profileGenres.length === 0) return 0;

  const union = new Set([
    ...viewerGenres.map((g) => g.toLowerCase()),
    ...profileGenres.map((g) => g.toLowerCase()),
  ]);
  const intersection = shared.length;

  // Jaccard similarity scaled to 0-100
  return (intersection / union.size) * 100;
}

/**
 * Calculate audio profile similarity score (0-100).
 */
function calculateProfileScore(
  viewerStats?: ExtendedStats,
  profileStats?: ExtendedStats
): number {
  if (!viewerStats?.hasAudioFeatures || !profileStats?.hasAudioFeatures) {
    // If no audio features, return neutral score
    return 50;
  }

  // Compare key audio metrics
  const metrics = [
    { viewer: viewerStats.energyScore, profile: profileStats.energyScore },
    { viewer: viewerStats.danceabilityScore, profile: profileStats.danceabilityScore },
    { viewer: viewerStats.moodScore, profile: profileStats.moodScore },
    { viewer: viewerStats.acousticScore, profile: profileStats.acousticScore },
    { viewer: viewerStats.mainstreamScore, profile: profileStats.mainstreamScore },
  ];

  // Calculate average difference (0-100 scale)
  let totalDiff = 0;
  for (const metric of metrics) {
    totalDiff += Math.abs(metric.viewer - metric.profile);
  }
  const avgDiff = totalDiff / metrics.length;

  // Convert to similarity (0 diff = 100 score, 100 diff = 0 score)
  return 100 - avgDiff;
}

/**
 * Build comparison stats for display.
 */
function buildComparisonStats(
  viewerStats?: ExtendedStats,
  profileStats?: ExtendedStats
): CompatibilityData["comparisonStats"] {
  if (!viewerStats || !profileStats) return [];

  const stats: CompatibilityData["comparisonStats"] = [];

  if (viewerStats.hasAudioFeatures && profileStats.hasAudioFeatures) {
    stats.push(
      {
        label: "Energy",
        viewerValue: viewerStats.energyScore,
        profileValue: profileStats.energyScore,
      },
      {
        label: "Danceability",
        viewerValue: viewerStats.danceabilityScore,
        profileValue: profileStats.danceabilityScore,
      },
      {
        label: "Mood",
        viewerValue: viewerStats.moodScore,
        profileValue: profileStats.moodScore,
      },
      {
        label: "Acoustic",
        viewerValue: viewerStats.acousticScore,
        profileValue: profileStats.acousticScore,
      }
    );
  }

  stats.push(
    {
      label: "Mainstream",
      viewerValue: viewerStats.mainstreamScore,
      profileValue: profileStats.mainstreamScore,
    },
    {
      label: "Genre Diversity",
      viewerValue: Math.min(100, viewerStats.genreDiversity * 2),
      profileValue: Math.min(100, profileStats.genreDiversity * 2),
    }
  );

  return stats;
}

/**
 * Get a text description of the compatibility score.
 */
export function getCompatibilityDescription(score: number): string {
  if (score >= 90) return "Musical soulmates!";
  if (score >= 75) return "Amazing taste match";
  if (score >= 60) return "Great compatibility";
  if (score >= 45) return "Some common ground";
  if (score >= 30) return "Different vibes";
  return "Opposite tastes";
}

/**
 * Get a color for the compatibility score.
 */
export function getCompatibilityColor(score: number): string {
  if (score >= 75) return "#1DB954"; // Spotify green
  if (score >= 50) return "#F59E0B"; // Amber
  return "#EF4444"; // Red
}
