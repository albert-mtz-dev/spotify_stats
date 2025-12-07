import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PrivacySettings } from "@/components/settings/PrivacySettings";
import type { UserSettings, ProfileVisibility, PrivacySettings as PrivacySettingsType } from "@/lib/types";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.userId) {
    redirect("/");
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
    redirect("/");
  }

  const privacy: PrivacySettingsType = {
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

  const initialSettings: UserSettings = {
    username: user.username,
    bio: user.bio,
    profileVisibility: user.profileVisibility as ProfileVisibility,
    hasCompletedOnboarding: user.hasCompletedOnboarding,
    privacy,
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-text-primary">Settings</h1>
        <p className="text-text-secondary mt-2">
          Manage your profile and privacy settings
        </p>
      </div>

      <PrivacySettings
        initialSettings={initialSettings}
        userId={session.userId}
      />
    </div>
  );
}
