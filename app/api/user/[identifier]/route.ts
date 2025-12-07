import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { aggregateGenresFromArtists, assignBadges } from "@/lib/analytics";
import type {
  PublicProfileData,
  ArtistSummary,
  TrackSummary,
} from "@/lib/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ identifier: string }> }
) {
  const { identifier } = await params;
  const session = await auth();

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

  // Check if profile is private and viewer is not the owner
  const isOwner = session?.userId === user.id;
  if (user.profileVisibility === "PRIVATE" && !isOwner) {
    return NextResponse.json(
      { error: "This profile is private" },
      { status: 403 }
    );
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

  // Parse stored data (limit to 5 for public profiles)
  const topArtists: ArtistSummary[] = artistsSnapshot
    ? (artistsSnapshot.data as unknown as ArtistSummary[]).slice(0, 5)
    : [];

  const topTracks: TrackSummary[] = tracksSnapshot
    ? (tracksSnapshot.data as unknown as TrackSummary[]).slice(0, 5)
    : [];

  // Calculate genres from artists
  const allArtists = artistsSnapshot
    ? (artistsSnapshot.data as unknown as ArtistSummary[])
    : [];
  const genres = aggregateGenresFromArtists(allArtists);
  const topGenres = genres.slice(0, 5).map((g) => g.genre);

  // Get badges
  const badges = assignBadges({
    topArtists: allArtists,
    genres,
    uniqueArtistsCount: allArtists.length,
    uniqueTracksCount: tracksSnapshot
      ? (tracksSnapshot.data as unknown as TrackSummary[]).length
      : 0,
    totalListeningTimeMs: 0,
  }).filter((b) => b.earnedAt !== null);

  const profileData: PublicProfileData = {
    user: {
      id: user.id,
      name: user.name || "Unknown",
      username: user.username,
      image: user.image,
      bio: user.bio,
      lastSyncedAt: user.lastSyncedAt,
    },
    stats: {
      topArtists,
      topTracks,
      topGenres,
      badges,
    },
  };

  return NextResponse.json(profileData);
}
