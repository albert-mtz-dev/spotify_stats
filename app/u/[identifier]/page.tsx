import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PublicProfile } from "@/components/profile/PublicProfile";
import type { PublicProfileData } from "@/lib/types";

interface ProfilePageProps {
  params: Promise<{ identifier: string }>;
}

async function getProfile(identifier: string): Promise<PublicProfileData | null> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  try {
    const response = await fetch(`${baseUrl}/api/user/${identifier}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch {
    return null;
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { identifier } = await params;
  const session = await auth();

  // Check if identifier is a user ID and if the user has a username
  // If so, redirect to the username URL for better SEO and UX
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ id: identifier }, { username: identifier }],
    },
    select: { id: true, username: true },
  });

  if (user && user.username && user.id === identifier) {
    // User accessed via ID but has a username - redirect to username URL
    redirect(`/u/${user.username}`);
  }

  const profile = await getProfile(identifier);

  if (!profile) {
    notFound();
  }

  const isOwner = session?.userId === profile.user.id;

  return <PublicProfile profile={profile} isOwner={isOwner} />;
}

export async function generateMetadata({ params }: ProfilePageProps) {
  const { identifier } = await params;
  const profile = await getProfile(identifier);

  if (!profile) {
    return { title: "Profile Not Found" };
  }

  return {
    title: `${profile.user.name} | Spotify Mirror`,
    description: profile.user.bio || `Check out ${profile.user.name}'s music taste on Spotify Mirror`,
  };
}
