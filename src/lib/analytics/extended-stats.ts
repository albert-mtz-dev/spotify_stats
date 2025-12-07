import type {
  ArtistSummary,
  TrackSummary,
  SpotifyAudioFeatures,
  ListeningPattern,
  ExtendedStats,
} from "../types";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Calculate mainstream score based on track popularity (0-100)
export function calculateMainstreamScore(tracks: TrackSummary[]): number {
  if (tracks.length === 0) return 50;
  const avgPopularity = tracks.reduce((sum, t) => sum + t.popularity, 0) / tracks.length;
  return Math.round(avgPopularity);
}

// Calculate average song length in milliseconds
export function calculateAvgSongLength(tracks: TrackSummary[]): number {
  if (tracks.length === 0) return 0;
  return Math.round(tracks.reduce((sum, t) => sum + t.durationMs, 0) / tracks.length);
}

// Count unique genres from artists
export function calculateGenreDiversity(artists: ArtistSummary[]): number {
  const allGenres = new Set<string>();
  artists.forEach((artist) => {
    artist.genres.forEach((genre) => allGenres.add(genre));
  });
  return allGenres.size;
}

// Find peak listening hour from patterns
export function findPeakListeningHour(patterns: ListeningPattern[]): number {
  const hourCounts = new Map<number, number>();

  patterns.forEach((p) => {
    hourCounts.set(p.hour, (hourCounts.get(p.hour) || 0) + p.count);
  });

  let peakHour = 12;
  let maxCount = 0;

  hourCounts.forEach((count, hour) => {
    if (count > maxCount) {
      maxCount = count;
      peakHour = hour;
    }
  });

  return peakHour;
}

// Find most active day of week
export function findMostActiveDay(patterns: ListeningPattern[]): string {
  const dayCounts = new Map<number, number>();

  patterns.forEach((p) => {
    dayCounts.set(p.dayOfWeek, (dayCounts.get(p.dayOfWeek) || 0) + p.count);
  });

  let peakDay = 0;
  let maxCount = 0;

  dayCounts.forEach((count, day) => {
    if (count > maxCount) {
      maxCount = count;
      peakDay = day;
    }
  });

  return DAY_NAMES[peakDay];
}

// Calculate energy score from audio features (0-100)
export function calculateEnergyScore(audioFeatures: SpotifyAudioFeatures[]): number {
  if (audioFeatures.length === 0) return 50;
  const avgEnergy = audioFeatures.reduce((sum, f) => sum + f.energy, 0) / audioFeatures.length;
  return Math.round(avgEnergy * 100);
}

// Calculate danceability score (0-100)
export function calculateDanceabilityScore(audioFeatures: SpotifyAudioFeatures[]): number {
  if (audioFeatures.length === 0) return 50;
  const avgDance = audioFeatures.reduce((sum, f) => sum + f.danceability, 0) / audioFeatures.length;
  return Math.round(avgDance * 100);
}

// Calculate mood/happiness score from valence (0-100)
export function calculateMoodScore(audioFeatures: SpotifyAudioFeatures[]): number {
  if (audioFeatures.length === 0) return 50;
  const avgValence = audioFeatures.reduce((sum, f) => sum + f.valence, 0) / audioFeatures.length;
  return Math.round(avgValence * 100);
}

// Calculate acoustic score (0-100)
export function calculateAcousticScore(audioFeatures: SpotifyAudioFeatures[]): number {
  if (audioFeatures.length === 0) return 50;
  const avgAcoustic = audioFeatures.reduce((sum, f) => sum + f.acousticness, 0) / audioFeatures.length;
  return Math.round(avgAcoustic * 100);
}

// Calculate average tempo (BPM)
export function calculateAvgTempo(audioFeatures: SpotifyAudioFeatures[]): number {
  if (audioFeatures.length === 0) return 120;
  const avgTempo = audioFeatures.reduce((sum, f) => sum + f.tempo, 0) / audioFeatures.length;
  return Math.round(avgTempo);
}

// Calculate loyalty score - how many long-term artists appear in short-term (0-100)
export function calculateLoyaltyScore(
  shortTermArtists: ArtistSummary[],
  longTermArtists: ArtistSummary[]
): number {
  if (shortTermArtists.length === 0 || longTermArtists.length === 0) return 50;

  const longTermIds = new Set(longTermArtists.map((a) => a.id));
  const overlap = shortTermArtists.filter((a) => longTermIds.has(a.id)).length;

  return Math.round((overlap / shortTermArtists.length) * 100);
}

// Calculate discovery rate - % of short-term artists NOT in long-term (0-100)
export function calculateDiscoveryRate(
  shortTermArtists: ArtistSummary[],
  longTermArtists: ArtistSummary[]
): number {
  if (shortTermArtists.length === 0) return 0;

  const longTermIds = new Set(longTermArtists.map((a) => a.id));
  const newArtists = shortTermArtists.filter((a) => !longTermIds.has(a.id)).length;

  return Math.round((newArtists / shortTermArtists.length) * 100);
}

// Calculate album explorer score - unique albums / total tracks * 100
export function calculateAlbumExplorerScore(tracks: TrackSummary[]): number {
  if (tracks.length === 0) return 0;

  const uniqueAlbums = new Set(tracks.map((t) => t.albumId)).size;
  // Higher ratio means more albums explored (not just same album repeatedly)
  // Max would be 100 if every track is from a different album
  return Math.round((uniqueAlbums / tracks.length) * 100);
}

// Calculate decade breakdown from track release dates
export function calculateDecadeBreakdown(
  tracks: TrackSummary[]
): { decade: string; percentage: number }[] {
  const decadeCounts = new Map<string, number>();
  let validTracks = 0;

  tracks.forEach((track) => {
    if (track.releaseDate) {
      const year = parseInt(track.releaseDate.substring(0, 4), 10);
      if (!isNaN(year)) {
        const decade = `${Math.floor(year / 10) * 10}s`;
        decadeCounts.set(decade, (decadeCounts.get(decade) || 0) + 1);
        validTracks++;
      }
    }
  });

  if (validTracks === 0) return [];

  const breakdown: { decade: string; percentage: number }[] = [];

  decadeCounts.forEach((count, decade) => {
    breakdown.push({
      decade,
      percentage: Math.round((count / validTracks) * 100),
    });
  });

  // Sort by decade descending (most recent first)
  breakdown.sort((a, b) => b.decade.localeCompare(a.decade));

  return breakdown;
}

// Compute all extended stats at once
export function computeExtendedStats(params: {
  shortTermTracks: TrackSummary[];
  mediumTermTracks: TrackSummary[];
  shortTermArtists: ArtistSummary[];
  mediumTermArtists: ArtistSummary[];
  longTermArtists: ArtistSummary[];
  audioFeatures: SpotifyAudioFeatures[];
  listeningPatterns: ListeningPattern[];
}): ExtendedStats {
  const {
    shortTermTracks,
    mediumTermTracks,
    shortTermArtists,
    mediumTermArtists,
    longTermArtists,
    audioFeatures,
    listeningPatterns,
  } = params;

  return {
    // Basic stats
    mainstreamScore: calculateMainstreamScore(mediumTermTracks),
    avgSongLengthMs: calculateAvgSongLength(mediumTermTracks),
    genreDiversity: calculateGenreDiversity(mediumTermArtists),
    peakListeningHour: findPeakListeningHour(listeningPatterns),
    mostActiveDay: findMostActiveDay(listeningPatterns),

    // Audio feature stats
    energyScore: calculateEnergyScore(audioFeatures),
    danceabilityScore: calculateDanceabilityScore(audioFeatures),
    moodScore: calculateMoodScore(audioFeatures),
    acousticScore: calculateAcousticScore(audioFeatures),
    avgTempo: calculateAvgTempo(audioFeatures),
    hasAudioFeatures: audioFeatures.length > 0,

    // Derived/fun stats
    loyaltyScore: calculateLoyaltyScore(shortTermArtists, longTermArtists),
    discoveryRate: calculateDiscoveryRate(shortTermArtists, longTermArtists),
    albumExplorerScore: calculateAlbumExplorerScore(mediumTermTracks),
    decadeBreakdown: calculateDecadeBreakdown([...shortTermTracks, ...mediumTermTracks]),
  };
}
