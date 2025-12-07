import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { UserSettings, ProfileVisibility, PrivacySettings } from "@/lib/types";

// Reserved usernames that cannot be claimed
const RESERVED_USERNAMES = [
  "admin",
  "administrator",
  "settings",
  "discover",
  "dashboard",
  "api",
  "auth",
  "login",
  "logout",
  "signup",
  "register",
  "profile",
  "user",
  "users",
  "account",
  "help",
  "support",
  "about",
  "terms",
  "privacy",
  "spotify",
  "mirror",
  "spotifymirror",
  "official",
  "mod",
  "moderator",
  "staff",
  "team",
  "null",
  "undefined",
  "root",
  "system",
  "follow",
  "followers",
  "following",
];

export async function GET() {
  const session = await auth();

  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      username: true,
      bio: true,
      profileVisibility: true,
      hasCompletedOnboarding: true,
      shareTopArtists: true,
      shareTopTracks: true,
      shareGenres: true,
      shareAudioProfile: true,
      shareBadges: true,
      shareListeningStats: true,
      sharePatterns: true,
      shareRecentlyPlayed: true,
      allowComparison: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const privacy: PrivacySettings = {
    shareTopArtists: user.shareTopArtists,
    shareTopTracks: user.shareTopTracks,
    shareGenres: user.shareGenres,
    shareAudioProfile: user.shareAudioProfile,
    shareBadges: user.shareBadges,
    shareListeningStats: user.shareListeningStats,
    sharePatterns: user.sharePatterns,
    shareRecentlyPlayed: user.shareRecentlyPlayed,
    allowComparison: user.allowComparison,
  };

  const settings: UserSettings = {
    username: user.username,
    bio: user.bio,
    profileVisibility: user.profileVisibility as ProfileVisibility,
    hasCompletedOnboarding: user.hasCompletedOnboarding,
    privacy,
  };

  return NextResponse.json(settings);
}

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { username, bio, profileVisibility, hasCompletedOnboarding, privacy } = body;

  // Validate username if provided
  if (username !== undefined) {
    if (username !== null) {
      const lowerUsername = username.toLowerCase();

      // Username validation: 3-20 chars, alphanumeric and underscores only
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
      if (!usernameRegex.test(username)) {
        return NextResponse.json(
          {
            error:
              "Username must be 3-20 characters and contain only letters, numbers, and underscores",
          },
          { status: 400 }
        );
      }

      // Check if username is reserved
      if (RESERVED_USERNAMES.includes(lowerUsername)) {
        return NextResponse.json(
          { error: "This username is reserved and cannot be used" },
          { status: 400 }
        );
      }

      // Check if username is taken
      const existingUser = await prisma.user.findUnique({
        where: { username: lowerUsername },
        select: { id: true },
      });

      if (existingUser && existingUser.id !== session.userId) {
        return NextResponse.json(
          { error: "Username is already taken" },
          { status: 409 }
        );
      }
    }
  }

  // Validate bio length
  if (bio !== undefined && bio !== null && bio.length > 160) {
    return NextResponse.json(
      { error: "Bio must be 160 characters or less" },
      { status: 400 }
    );
  }

  // Validate profileVisibility
  if (
    profileVisibility !== undefined &&
    !["PUBLIC", "FOLLOWERS", "PRIVATE"].includes(profileVisibility)
  ) {
    return NextResponse.json(
      { error: "Invalid profile visibility" },
      { status: 400 }
    );
  }

  // Build update data
  const updateData: Record<string, unknown> = {};
  if (username !== undefined) updateData.username = username?.toLowerCase() ?? null;
  if (bio !== undefined) updateData.bio = bio;
  if (profileVisibility !== undefined) updateData.profileVisibility = profileVisibility;
  if (hasCompletedOnboarding !== undefined) updateData.hasCompletedOnboarding = hasCompletedOnboarding;

  // Handle privacy settings
  if (privacy !== undefined && typeof privacy === "object") {
    const privacyFields = [
      "shareTopArtists",
      "shareTopTracks",
      "shareGenres",
      "shareAudioProfile",
      "shareBadges",
      "shareListeningStats",
      "sharePatterns",
      "shareRecentlyPlayed",
      "allowComparison",
    ];

    for (const field of privacyFields) {
      if (field in privacy && typeof privacy[field] === "boolean") {
        updateData[field] = privacy[field];
      }
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: session.userId },
    data: updateData,
    select: {
      username: true,
      bio: true,
      profileVisibility: true,
      hasCompletedOnboarding: true,
      shareTopArtists: true,
      shareTopTracks: true,
      shareGenres: true,
      shareAudioProfile: true,
      shareBadges: true,
      shareListeningStats: true,
      sharePatterns: true,
      shareRecentlyPlayed: true,
      allowComparison: true,
    },
  });

  const updatedPrivacy: PrivacySettings = {
    shareTopArtists: updatedUser.shareTopArtists,
    shareTopTracks: updatedUser.shareTopTracks,
    shareGenres: updatedUser.shareGenres,
    shareAudioProfile: updatedUser.shareAudioProfile,
    shareBadges: updatedUser.shareBadges,
    shareListeningStats: updatedUser.shareListeningStats,
    sharePatterns: updatedUser.sharePatterns,
    shareRecentlyPlayed: updatedUser.shareRecentlyPlayed,
    allowComparison: updatedUser.allowComparison,
  };

  const settings: UserSettings = {
    username: updatedUser.username,
    bio: updatedUser.bio,
    profileVisibility: updatedUser.profileVisibility as ProfileVisibility,
    hasCompletedOnboarding: updatedUser.hasCompletedOnboarding,
    privacy: updatedPrivacy,
  };

  return NextResponse.json(settings);
}
