import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { UserSearchResult } from "@/lib/types";

export async function GET(request: Request) {
  const session = await auth();
  const viewerId = session?.userId;

  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 20);

  // Get recently joined public users who have synced their data (exclude current user)
  const users = await prisma.user.findMany({
    where: {
      profileVisibility: "PUBLIC",
      lastSyncedAt: { not: null },
      ...(viewerId ? { NOT: { id: viewerId } } : {}),
    },
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
      bio: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  const results: UserSearchResult[] = users.map((user) => ({
    id: user.id,
    name: user.name || "Unknown",
    username: user.username,
    image: user.image,
    bio: user.bio,
  }));

  return NextResponse.json({ users: results });
}
