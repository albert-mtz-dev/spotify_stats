import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { syncUserData } from "@/lib/spotify-sync";
import { prisma } from "@/lib/prisma";

// Rate limit: users can only manually sync once per 5 minutes
const SYNC_COOLDOWN_MS = 5 * 60 * 1000;

export async function POST() {
  const session = await auth();

  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check cooldown
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { lastSyncedAt: true },
  });

  if (user?.lastSyncedAt) {
    const timeSinceLastSync = Date.now() - user.lastSyncedAt.getTime();
    if (timeSinceLastSync < SYNC_COOLDOWN_MS) {
      const waitTime = Math.ceil((SYNC_COOLDOWN_MS - timeSinceLastSync) / 1000);
      return NextResponse.json(
        { error: `Please wait ${waitTime} seconds before syncing again` },
        { status: 429 }
      );
    }
  }

  try {
    const success = await syncUserData(session.userId);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to sync data. Please try logging in again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Manual sync error:", error);
    return NextResponse.json(
      { error: "Sync failed" },
      { status: 500 }
    );
  }
}
