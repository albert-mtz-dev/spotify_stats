import { NextResponse } from "next/server";
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

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
  const offset = parseInt(searchParams.get("offset") || "0");

  // Don't search if query is too short
  if (query.length < 2) {
    return NextResponse.json({ users: [], total: 0 });
  }

  // Search public users by name or username
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: {
        profileVisibility: "PUBLIC",
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { username: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        bio: true,
      },
      take: limit,
      skip: offset,
      orderBy: { name: "asc" },
    }),
    prisma.user.count({
      where: {
        profileVisibility: "PUBLIC",
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { username: { contains: query, mode: "insensitive" } },
        ],
      },
    }),
  ]);

  const results: UserSearchResult[] = users.map((user) => ({
    id: user.id,
    name: user.name || "Unknown",
    username: user.username,
    image: user.image,
    bio: user.bio,
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
