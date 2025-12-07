import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import type { UserSearchResult } from "@/lib/types";

// Rate limit: 30 requests per minute per IP
const RATE_LIMIT_OPTIONS = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30,
};

export async function GET(request: Request) {
  // Check rate limit
  const clientIP = getClientIP(request);
  const rateLimitResult = checkRateLimit(`search:${clientIP}`, RATE_LIMIT_OPTIONS);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": rateLimitResult.resetTime.toString(),
          "Retry-After": Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  const session = await auth();
  const viewerId = session?.userId;

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
  const offset = parseInt(searchParams.get("offset") || "0");

  // Don't search if query is too short
  if (query.length < 2) {
    return NextResponse.json({ users: [], total: 0 });
  }

  // Search public users by name or username (exclude current user)
  const visibilityOptions: ("PUBLIC" | "FOLLOWERS")[] = ["PUBLIC", "FOLLOWERS"];
  const whereClause = {
    profileVisibility: { in: visibilityOptions },
    OR: [
      { name: { contains: query, mode: "insensitive" as const } },
      { username: { contains: query, mode: "insensitive" as const } },
    ],
    ...(viewerId ? { NOT: { id: viewerId } } : {}),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        bio: true,
        profileVisibility: true,
        _count: {
          select: {
            followers: true,
          },
        },
      },
      take: limit,
      skip: offset,
      orderBy: [
        { followers: { _count: "desc" } },
        { name: "asc" },
      ],
    }),
    prisma.user.count({ where: whereClause }),
  ]);

  // Get follow status for each user if viewer is logged in
  let followingIds: Set<string> = new Set();
  if (viewerId) {
    const following = await prisma.follow.findMany({
      where: {
        followerId: viewerId,
        followingId: { in: users.map((u) => u.id) },
      },
      select: { followingId: true },
    });
    followingIds = new Set(following.map((f) => f.followingId));
  }

  const results: UserSearchResult[] = users.map((user) => ({
    id: user.id,
    name: user.name || "Unknown",
    username: user.username,
    image: user.image,
    bio: user.bio,
    isFollowing: followingIds.has(user.id),
  }));

  return NextResponse.json(
    { users: results, total },
    {
      headers: {
        "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
        "X-RateLimit-Reset": rateLimitResult.resetTime.toString(),
      },
    }
  );
}
