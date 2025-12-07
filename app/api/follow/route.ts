import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/follow - Follow a user
 * Body: { userId: string }
 *
 * For PUBLIC profiles: Creates immediate follow
 * For FOLLOWERS profiles: Creates follow request
 * For PRIVATE profiles: Returns error (cannot follow)
 */
export async function POST(request: Request) {
  const session = await auth();

  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { userId: targetUserId } = body;

  if (!targetUserId || typeof targetUserId !== "string") {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  // Cannot follow yourself
  if (targetUserId === session.userId) {
    return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
  }

  // Get target user
  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: {
      id: true,
      profileVisibility: true,
    },
  });

  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Check if already following
  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: session.userId,
        followingId: targetUserId,
      },
    },
  });

  if (existingFollow) {
    return NextResponse.json({ error: "Already following this user" }, { status: 409 });
  }

  // Handle based on profile visibility
  if (targetUser.profileVisibility === "PRIVATE") {
    return NextResponse.json(
      { error: "This user has a private profile and cannot be followed" },
      { status: 403 }
    );
  }

  if (targetUser.profileVisibility === "FOLLOWERS") {
    // Check for existing pending request
    const existingRequest = await prisma.followRequest.findUnique({
      where: {
        fromUserId_toUserId: {
          fromUserId: session.userId,
          toUserId: targetUserId,
        },
      },
    });

    if (existingRequest) {
      if (existingRequest.status === "PENDING") {
        return NextResponse.json(
          { message: "Follow request already pending", status: "pending" },
          { status: 200 }
        );
      }
      if (existingRequest.status === "REJECTED") {
        // Update to pending again
        await prisma.followRequest.update({
          where: { id: existingRequest.id },
          data: { status: "PENDING", updatedAt: new Date() },
        });
        return NextResponse.json({
          message: "Follow request sent",
          status: "pending",
        });
      }
    }

    // Create follow request
    await prisma.followRequest.create({
      data: {
        fromUserId: session.userId,
        toUserId: targetUserId,
      },
    });

    return NextResponse.json({
      message: "Follow request sent",
      status: "pending",
    });
  }

  // PUBLIC profile - create immediate follow
  await prisma.follow.create({
    data: {
      followerId: session.userId,
      followingId: targetUserId,
    },
  });

  return NextResponse.json({
    message: "Now following user",
    status: "following",
  });
}

/**
 * DELETE /api/follow - Unfollow a user or cancel follow request
 * Body: { userId: string }
 */
export async function DELETE(request: Request) {
  const session = await auth();

  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { userId: targetUserId } = body;

  if (!targetUserId || typeof targetUserId !== "string") {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  // Try to delete follow
  const deletedFollow = await prisma.follow.deleteMany({
    where: {
      followerId: session.userId,
      followingId: targetUserId,
    },
  });

  // Also delete any pending request
  await prisma.followRequest.deleteMany({
    where: {
      fromUserId: session.userId,
      toUserId: targetUserId,
    },
  });

  if (deletedFollow.count > 0) {
    return NextResponse.json({ message: "Unfollowed user" });
  }

  return NextResponse.json({ message: "Follow/request removed" });
}

/**
 * GET /api/follow - Get followers and following lists
 * Query: ?type=followers|following&userId=optional
 */
export async function GET(request: Request) {
  const session = await auth();
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "followers";
  const userId = searchParams.get("userId") || session?.userId;

  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 400 });
  }

  if (type === "followers") {
    const followers = await prisma.follow.findMany({
      where: { followingId: userId },
      include: {
        follower: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            bio: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      users: followers.map((f) => ({
        id: f.follower.id,
        name: f.follower.name,
        username: f.follower.username,
        image: f.follower.image,
        bio: f.follower.bio,
        followedAt: f.createdAt,
      })),
      count: followers.length,
    });
  }

  if (type === "following") {
    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      include: {
        following: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            bio: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      users: following.map((f) => ({
        id: f.following.id,
        name: f.following.name,
        username: f.following.username,
        image: f.following.image,
        bio: f.following.bio,
        followedAt: f.createdAt,
      })),
      count: following.length,
    });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}
