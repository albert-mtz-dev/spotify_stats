import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  aggregateGenresFromArtists,
  assignBadges,
  calculateCompatibility,
  bucketPlaysByHourAndWeekday,
  computeExtendedStats,
} from "@/lib/analytics";
import type {
  PublicProfileData,
  ArtistSummary,
  TrackSummary,
  SpotifyRecentlyPlayed,
} from "@/lib/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ identifier: string }> }
) {
  const { identifier } = await params;
  const session = await auth();
  const viewerId = session?.userId;

  // Find user by ID or username
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ id: identifier }, { username: identifier }],
    },
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
      bio: true,
      profileVisibility: true,
      lastSyncedAt: true,
      // Privacy settings
      shareTopArtists: true,
      shareTopTracks: true,
      shareGenres: true,
      shareAudioProfile: true,
      shareBadges: true,
      shareListeningStats: true,
      sharePatterns: true,
      allowComparison: true,
      // Follower counts
      _count: {
        select: {
          followers: true,
          following: true,
        },
      },
      badges: {
        select: {
          badgeId: true,
          earnedAt: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const isOwner = viewerId === user.id;

  // Check viewer relationship
  let isFollowing = false;
  let isFollowedBy = false;
  let hasPendingRequest = false;

  if (viewerId && !isOwner) {
    const [followingRecord, followedByRecord, pendingRequest] = await Promise.all([
      prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: viewerId,
            followingId: user.id,
          },
        },
      }),
      prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: user.id,
            followingId: viewerId,
          },
        },
      }),
      prisma.followRequest.findFirst({
        where: {
          fromUserId: viewerId,
          toUserId: user.id,
          status: "PENDING",
        },
      }),
    ]);

    isFollowing = !!followingRecord;
    isFollowedBy = !!followedByRecord;
    hasPendingRequest = !!pendingRequest;
  }

  // Determine if viewer can see the profile
  let canView = isOwner;
  if (!isOwner) {
    if (user.profileVisibility === "PUBLIC") {
      canView = true;
    } else if (user.profileVisibility === "FOLLOWERS") {
      canView = isFollowing;
    }
    // PRIVATE: canView stays false
  }

  // Base response for restricted profiles
  const baseResponse: PublicProfileData = {
    user: {
      id: user.id,
      name: user.name || "Unknown",
      username: user.username,
      image: user.image,
      bio: user.bio,
      lastSyncedAt: user.lastSyncedAt,
      followerCount: user._count.followers,
      followingCount: user._count.following,
    },
    stats: {
      topArtists: [],
      topTracks: [],
      topGenres: [],
      badges: [],
    },
    viewerRelationship: {
      isFollowing,
      isFollowedBy,
      hasPendingRequest,
      canView,
    },
  };

  if (!canView) {
    return NextResponse.json(baseResponse);
  }

  // Get stored Spotify data from snapshots (medium_term for public profiles)
  const [artistsSnapshot, tracksSnapshot] = await Promise.all([
    prisma.spotifySnapshot.findFirst({
      where: {
        userId: user.id,
        type: "artists",
        timeRange: "medium_term",
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.spotifySnapshot.findFirst({
      where: {
        userId: user.id,
        type: "tracks",
        timeRange: "medium_term",
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Parse stored data
  const allArtists: ArtistSummary[] = artistsSnapshot
    ? (artistsSnapshot.data as unknown as ArtistSummary[])
    : [];

  const allTracks: TrackSummary[] = tracksSnapshot
    ? (tracksSnapshot.data as unknown as TrackSummary[])
    : [];

  // Respect privacy settings
  const topArtists = user.shareTopArtists ? allArtists.slice(0, 10) : [];
  const topTracks = user.shareTopTracks ? allTracks.slice(0, 10) : [];

  // Calculate genres
  const genres = aggregateGenresFromArtists(allArtists);
  const topGenres = user.shareGenres ? genres.slice(0, 5).map((g) => g.genre) : [];

  // Get badges
  const badges = user.shareBadges
    ? assignBadges({
        topArtists: allArtists,
        genres,
        uniqueArtistsCount: allArtists.length,
        uniqueTracksCount: allTracks.length,
        totalListeningTimeMs: 0,
      }).filter((b) => b.earnedAt !== null)
    : [];

  // Build response with privacy-aware data
  const profileData: PublicProfileData = {
    ...baseResponse,
    stats: {
      topArtists,
      topTracks,
      topGenres,
      badges,
    },
  };

  // Add listening stats if shared
  if (user.shareListeningStats) {
    profileData.stats.listeningStats = {
      totalListeningTimeMs: allTracks.reduce((acc, t) => acc + t.durationMs, 0),
      uniqueArtists: new Set(allArtists.map((a) => a.id)).size,
      uniqueTracks: allTracks.length,
    };
  }

  // Add extended stats/audio profile if shared
  if (user.shareAudioProfile) {
    const extendedStats = computeExtendedStats({
      shortTermTracks: [],
      mediumTermTracks: allTracks,
      shortTermArtists: [],
      mediumTermArtists: allArtists,
      longTermArtists: allArtists,
      audioFeatures: [],
      listeningPatterns: [],
    });
    profileData.stats.extendedStats = extendedStats;
  }

  // Add listening patterns if shared
  if (user.sharePatterns) {
    const recentHistory = await prisma.listeningHistory.findMany({
      where: { userId: user.id },
      orderBy: { playedAt: "desc" },
      take: 50,
    });

    const recentlyPlayed: SpotifyRecentlyPlayed[] = recentHistory.map((h) => ({
      track: {
        id: h.trackId,
        name: h.trackName,
        artists: h.artistNames.map((name) => ({ id: "", name })),
        album: { id: "", name: h.albumName, images: [], external_urls: { spotify: "" }, release_date: "" },
        duration_ms: h.durationMs,
        popularity: 0,
        external_urls: { spotify: "" },
      },
      played_at: h.playedAt.toISOString(),
    }));

    profileData.stats.listeningPatterns = bucketPlaysByHourAndWeekday(recentlyPlayed);
  }

  // Calculate compatibility if viewer is logged in and allowed
  if (viewerId && !isOwner && user.allowComparison) {
    // Get viewer's data
    const [viewerArtistsSnapshot, viewerTracksSnapshot] = await Promise.all([
      prisma.spotifySnapshot.findFirst({
        where: {
          userId: viewerId,
          type: "artists",
          timeRange: "medium_term",
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.spotifySnapshot.findFirst({
        where: {
          userId: viewerId,
          type: "tracks",
          timeRange: "medium_term",
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    if (viewerArtistsSnapshot) {
      const viewerArtists = viewerArtistsSnapshot.data as unknown as ArtistSummary[];
      const viewerTracks = viewerTracksSnapshot
        ? (viewerTracksSnapshot.data as unknown as TrackSummary[])
        : [];

      const viewerGenres = aggregateGenresFromArtists(viewerArtists);
      const profileGenres = genres;

      // Get extended stats for both
      const viewerExtended = computeExtendedStats({
        shortTermTracks: [],
        mediumTermTracks: viewerTracks,
        shortTermArtists: [],
        mediumTermArtists: viewerArtists,
        longTermArtists: viewerArtists,
        audioFeatures: [],
        listeningPatterns: [],
      });

      const profileExtended = profileData.stats.extendedStats || computeExtendedStats({
        shortTermTracks: [],
        mediumTermTracks: allTracks,
        shortTermArtists: [],
        mediumTermArtists: allArtists,
        longTermArtists: allArtists,
        audioFeatures: [],
        listeningPatterns: [],
      });

      profileData.compatibility = calculateCompatibility(
        {
          topArtists: viewerArtists,
          genres: viewerGenres.map((g) => g.genre),
          extendedStats: viewerExtended,
        },
        {
          topArtists: allArtists,
          genres: profileGenres.map((g) => g.genre),
          extendedStats: profileExtended,
        }
      );
    }
  }

  return NextResponse.json(profileData);
}
