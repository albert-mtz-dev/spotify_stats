import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  getTopArtists,
  getTopTracks,
  getRecentlyPlayed,
} from "@/lib/spotify";
import {
  aggregateGenresFromArtists,
  bucketPlaysByHourAndWeekday,
  calculateTotalListeningTime,
  assignBadges,
  extractTopAlbumsFromTracks,
} from "@/lib/analytics";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import type { DashboardData } from "@/lib/types";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.accessToken) {
    redirect("/");
  }

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

    // Extract top albums from top tracks
    const shortTermAlbums = extractTopAlbumsFromTracks(shortTermTracks);
    const mediumTermAlbums = extractTopAlbumsFromTracks(mediumTermTracks);
    const longTermAlbums = extractTopAlbumsFromTracks(longTermTracks);

    // Compute analytics
    const genres = aggregateGenresFromArtists(mediumTermArtists);
    const listeningPatterns = bucketPlaysByHourAndWeekday(recentlyPlayed);
    const totalListeningTimeMs = calculateTotalListeningTime(recentlyPlayed);

    // Get unique counts
    const uniqueArtistIds = new Set(mediumTermArtists.map((a) => a.id));
    const uniqueTrackIds = new Set(mediumTermTracks.map((t) => t.id));

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

    return <DashboardContent data={dashboardData} />;
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
        <a
          href="/"
          className="px-4 py-2 bg-accent text-black rounded-full font-medium hover:bg-accent-soft transition-colors"
        >
          Go Back
        </a>
      </div>
    );
  }
}
