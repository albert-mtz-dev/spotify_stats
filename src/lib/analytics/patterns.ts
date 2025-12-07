import type { SpotifyRecentlyPlayed, ListeningPattern } from "../types";

export function bucketPlaysByHourAndWeekday(
  recentlyPlayed: SpotifyRecentlyPlayed[]
): ListeningPattern[] {
  const buckets = new Map<string, number>();

  for (const item of recentlyPlayed) {
    const date = new Date(item.played_at);
    const hour = date.getHours();
    const dayOfWeek = date.getDay(); // 0 = Sunday
    const key = `${hour}-${dayOfWeek}`;

    buckets.set(key, (buckets.get(key) || 0) + 1);
  }

  const patterns: ListeningPattern[] = [];

  // Generate all hour/day combinations
  for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
    for (let hour = 0; hour < 24; hour++) {
      const key = `${hour}-${dayOfWeek}`;
      patterns.push({
        hour,
        dayOfWeek,
        count: buckets.get(key) || 0,
      });
    }
  }

  return patterns;
}

export function calculateTotalListeningTime(
  recentlyPlayed: SpotifyRecentlyPlayed[]
): number {
  return recentlyPlayed.reduce((total, item) => {
    return total + item.track.duration_ms;
  }, 0);
}

export function formatDuration(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}
