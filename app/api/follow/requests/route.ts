import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/follow/requests - Get pending follow requests
 * Returns requests received by the authenticated user
 */
export async function GET() {
  const session = await auth();

  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requests = await prisma.followRequest.findMany({
    where: {
      toUserId: session.userId,
      status: "PENDING",
    },
    include: {
      from: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    requests: requests.map((r: { id: string; from: unknown; status: string; createdAt: Date }) => ({
      id: r.id,
      fromUser: r.from,
      status: r.status,
      createdAt: r.createdAt,
    })),
    count: requests.length,
  });
}

/**
 * POST /api/follow/requests - Respond to a follow request
 * Body: { requestId: string, action: "accept" | "reject" }
 */
export async function POST(request: Request) {
  const session = await auth();

  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { requestId, action } = body;

  if (!requestId || typeof requestId !== "string") {
    return NextResponse.json({ error: "Request ID is required" }, { status: 400 });
  }

  if (!action || !["accept", "reject"].includes(action)) {
    return NextResponse.json(
      { error: "Action must be 'accept' or 'reject'" },
      { status: 400 }
    );
  }

  // Get the request
  const followRequest = await prisma.followRequest.findUnique({
    where: { id: requestId },
  });

  if (!followRequest) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  // Verify the request is for the authenticated user
  if (followRequest.toUserId !== session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (followRequest.status !== "PENDING") {
    return NextResponse.json(
      { error: "Request has already been processed" },
      { status: 400 }
    );
  }

  if (action === "accept") {
    // Create the follow relationship and update request status
    await prisma.$transaction([
      prisma.follow.create({
        data: {
          followerId: followRequest.fromUserId,
          followingId: followRequest.toUserId,
        },
      }),
      prisma.followRequest.update({
        where: { id: requestId },
        data: { status: "ACCEPTED" },
      }),
    ]);

    return NextResponse.json({ message: "Follow request accepted" });
  }

  // Reject the request
  await prisma.followRequest.update({
    where: { id: requestId },
    data: { status: "REJECTED" },
  });

  return NextResponse.json({ message: "Follow request rejected" });
}

/**
 * DELETE /api/follow/requests - Remove a follower (for the authenticated user)
 * Body: { userId: string }
 */
export async function DELETE(request: Request) {
  const session = await auth();

  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { userId: followerUserId } = body;

  if (!followerUserId || typeof followerUserId !== "string") {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  // Remove the follower (where they follow the authenticated user)
  const deleted = await prisma.follow.deleteMany({
    where: {
      followerId: followerUserId,
      followingId: session.userId,
    },
  });

  if (deleted.count === 0) {
    return NextResponse.json({ error: "This user is not following you" }, { status: 404 });
  }

  return NextResponse.json({ message: "Follower removed" });
}
