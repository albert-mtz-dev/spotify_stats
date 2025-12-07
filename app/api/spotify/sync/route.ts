import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getTopArtists,
  getTopTracks,
  getRecentlyPlayed,
} from "@/lib/spotify";
import type { TimeRange } from "@/lib/types";
import type { Prisma } from "@prisma/client";

const TIME_RANGES: TimeRange[] = ["short_term", "medium_term", "long_term"];

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.email || !session.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find or create user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch and store top artists for all time ranges
    for (const timeRange of TIME_RANGES) {
      const artists = await getTopArtists(session.accessToken, timeRange, 50);

      await prisma.spotifySnapshot.upsert({
        where: {
          id: `${user.id}-artists-${timeRange}`,
        },
        update: {
          data: artists as unknown as Prisma.JsonArray,
          createdAt: new Date(),
        },
        create: {
          id: `${user.id}-artists-${timeRange}`,
          userId: user.id,
          timeRange,
          type: "artists",
          data: artists as unknown as Prisma.JsonArray,
        },
      });
    }

    // Fetch and store top tracks for all time ranges
    for (const timeRange of TIME_RANGES) {
      const tracks = await getTopTracks(session.accessToken, timeRange, 50);

      await prisma.spotifySnapshot.upsert({
        where: {
          id: `${user.id}-tracks-${timeRange}`,
        },
        update: {
          data: tracks as unknown as Prisma.JsonArray,
          createdAt: new Date(),
        },
        create: {
          id: `${user.id}-tracks-${timeRange}`,
          userId: user.id,
          timeRange,
          type: "tracks",
          data: tracks as unknown as Prisma.JsonArray,
        },
      });
    }

    // Fetch and store recently played
    const recentlyPlayed = await getRecentlyPlayed(session.accessToken, 50);

    for (const item of recentlyPlayed) {
      await prisma.listeningHistory.upsert({
        where: {
          userId_trackId_playedAt: {
            userId: user.id,
            trackId: item.track.id,
            playedAt: new Date(item.played_at),
          },
        },
        update: {},
        create: {
          userId: user.id,
          trackId: item.track.id,
          trackName: item.track.name,
          artistNames: item.track.artists.map((a) => a.name),
          albumName: item.track.album.name,
          playedAt: new Date(item.played_at),
          durationMs: item.track.duration_ms,
        },
      });
    }

    return NextResponse.json({
      success: true,
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync data" },
      { status: 500 }
    );
  }
}
