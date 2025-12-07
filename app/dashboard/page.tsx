import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  getTopArtists,
  getTopTracks,
  getRecentlyPlayed,
  getAudioFeatures,
} from "@/lib/spotify";
import {
  aggregateGenresFromArtists,
  bucketPlaysByHourAndWeekday,
  calculateTotalListeningTime,
  assignBadges,
  extractTopAlbumsFromTracks,
  computeExtendedStats,
} from "@/lib/analytics";
import { prisma } from "@/lib/prisma";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import type { DashboardData, ArtistSummary, TrackSummary } from "@/lib/types";

// Save data to database for public profiles
async function saveToDatabase(
  userId: string,
  data: {
    shortTermArtists: ArtistSummary[];
    mediumTermArtists: ArtistSummary[];
    longTermArtists: ArtistSummary[];
    shortTermTracks: TrackSummary[];
    mediumTermTracks: TrackSummary[];
    longTermTracks: TrackSummary[];
  }
) {
  const timeRanges = ["short_term", "medium_term", "long_term"] as const;
  const artistData = [data.shortTermArtists, data.mediumTermArtists, data.longTermArtists];
  const trackData = [data.shortTermTracks, data.mediumTermTracks, data.longTermTracks];

  // Save artists
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
  }

  // Save tracks
  for (let i = 0; i < timeRanges.length; i++) {
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
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.accessToken || !session?.userId) {
    redirect("/");
  }

  // Check if user has completed onboarding and get username
  const userSettings = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { hasCompletedOnboarding: true, username: true },
  });

  const showVisibilityNotice = !userSettings?.hasCompletedOnboarding;

  try {
    // Fetch data from Spotify in parallel
    const [
      shortTermArtists,
      mediumTermArtists,
      longTermArtists,
      shortTermTracks,
      mediumTermTracks,
      longTermTracks,
      recentlyPlayed,
    ] = await Promise.all([
      getTopArtists(session.accessToken, "short_term", 20),
      getTopArtists(session.accessToken, "medium_term", 20),
      getTopArtists(session.accessToken, "long_term", 20),
      getTopTracks(session.accessToken, "short_term", 50),
      getTopTracks(session.accessToken, "medium_term", 50),
      getTopTracks(session.accessToken, "long_term", 50),
      getRecentlyPlayed(session.accessToken, 50),
    ]);

    // Fetch audio features for medium-term tracks (most representative)
    // This may fail with 403 if the Spotify app doesn't have extended quota mode
    const trackIds = mediumTermTracks.map((t) => t.id);
    let audioFeatures: Awaited<ReturnType<typeof getAudioFeatures>> = [];
    try {
      audioFeatures = await getAudioFeatures(session.accessToken, trackIds);
    } catch (error) {
      console.warn("Could not fetch audio features (may require extended quota mode):", error);
      audioFeatures = [];
    }

    // Extract top albums from top tracks
    const shortTermAlbums = extractTopAlbumsFromTracks(shortTermTracks);
    const mediumTermAlbums = extractTopAlbumsFromTracks(mediumTermTracks);
    const longTermAlbums = extractTopAlbumsFromTracks(longTermTracks);

    // Auto-sync: Save data to database for public profiles (non-blocking)
    saveToDatabase(session.userId, {
      shortTermArtists,
      mediumTermArtists,
      longTermArtists,
      shortTermTracks,
      mediumTermTracks,
      longTermTracks,
    }).catch((err) => console.error("Auto-sync error:", err));

    // Compute analytics
    const genres = aggregateGenresFromArtists(mediumTermArtists);
    const listeningPatterns = bucketPlaysByHourAndWeekday(recentlyPlayed);
    const totalListeningTimeMs = calculateTotalListeningTime(recentlyPlayed);

    // Get unique counts
    const uniqueArtistIds = new Set(mediumTermArtists.map((a) => a.id));
    const uniqueTrackIds = new Set(mediumTermTracks.map((t) => t.id));

    // Compute extended stats
    const extendedStats = computeExtendedStats({
      shortTermTracks,
      mediumTermTracks,
      shortTermArtists,
      mediumTermArtists,
      longTermArtists,
      audioFeatures,
      listeningPatterns,
    });

    // Assign badges
    const badges = assignBadges({
      topArtists: mediumTermArtists,
      genres,
      uniqueArtistsCount: uniqueArtistIds.size,
      uniqueTracksCount: uniqueTrackIds.size,
      totalListeningTimeMs,
    });

    const dashboardData: DashboardData = {
      user: {
        name: session.user?.name || "User",
        email: session.user?.email || "",
        image: session.user?.image || null,
      },
      stats: {
        totalListeningTimeMs,
        uniqueArtists: uniqueArtistIds.size,
        uniqueTracks: uniqueTrackIds.size,
        topGenre: genres[0]?.genre || null,
      },
      extendedStats,
      topArtists: {
        shortTerm: shortTermArtists,
        mediumTerm: mediumTermArtists,
        longTerm: longTermArtists,
      },
      topTracks: {
        shortTerm: shortTermTracks,
        mediumTerm: mediumTermTracks,
        longTerm: longTermTracks,
      },
      topAlbums: {
        shortTerm: shortTermAlbums,
        mediumTerm: mediumTermAlbums,
        longTerm: longTermAlbums,
      },
      genres: genres.slice(0, 10),
      listeningPatterns,
      badges,
      lastSyncedAt: new Date(),
    };

    return (
      <DashboardContent
        data={dashboardData}
        showVisibilityNotice={showVisibilityNotice}
        userId={session.userId}
        username={userSettings?.username}
      />
    );
  } catch (error) {
    console.error("Error fetching Spotify data:", error);
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h2 className="text-xl font-semibold text-text-primary mb-2">
          Unable to load your music data
        </h2>
        <p className="text-text-secondary mb-4">
          There was an error connecting to Spotify. Please try again.
        </p>
        <Link
          href="/"
          className="px-4 py-2 bg-accent text-black rounded-full font-medium hover:bg-accent-soft transition-colors"
        >
          Go Back
        </Link>
      </div>
    );
  }
}
