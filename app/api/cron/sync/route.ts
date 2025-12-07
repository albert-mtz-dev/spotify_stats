import { NextResponse } from "next/server";
import { runBatchSync } from "@/lib/spotify-sync";

// This endpoint is called by Vercel Cron
// Configure in vercel.json with schedule

export async function GET(request: Request) {
  // Verify the request is from Vercel Cron (in production)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // In production, verify the cron secret
  if (process.env.NODE_ENV === "production" && cronSecret) {
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    console.log("Starting batch sync...");
    const startTime = Date.now();

    // Sync users who haven't synced in 24 hours (cron runs daily on Hobby plan)
    const result = await runBatchSync(24);

    const duration = Date.now() - startTime;

    console.log(
      `Batch sync completed: ${result.successful}/${result.total} successful in ${duration}ms`
    );

    return NextResponse.json({
      success: true,
      ...result,
      durationMs: duration,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Batch sync error:", error);
    return NextResponse.json(
      { error: "Sync failed", message: String(error) },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggers
export async function POST(request: Request) {
  return GET(request);
}
