"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { FollowButton } from "@/components/social/FollowButton";
import type { UserSearchResult } from "@/lib/types";

interface UserCardProps {
  user: UserSearchResult;
  showFollowButton?: boolean;
  currentUserId?: string;
}

export function UserCard({ user, showFollowButton = true, currentUserId }: UserCardProps) {
  const profileUrl = `/u/${user.username || user.id}`;
  const [isFollowing, setIsFollowing] = useState(user.isFollowing ?? false);
  const isOwnProfile = currentUserId === user.id;

  const handleFollowChange = (newState: string) => {
    setIsFollowing(newState === "following");
  };

  return (
    <motion.div
      className="bg-bg-elevated rounded-xl border border-border-subtle p-4 hover:border-accent/50 transition-colors"
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.15 }}
    >
      <div className="flex items-center gap-4">
        <Link href={profileUrl} className="shrink-0">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name}
              width={56}
              height={56}
              className="w-14 h-14 rounded-full"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-bg-highlight flex items-center justify-center">
              <span className="text-xl font-bold text-text-secondary">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </Link>

        <Link href={profileUrl} className="flex-1 min-w-0">
          <p className="font-medium text-text-primary truncate hover:text-accent transition-colors">
            {user.name}
          </p>
          {user.username && (
            <p className="text-sm text-text-secondary">@{user.username}</p>
          )}
          {user.bio && (
            <p className="text-sm text-text-secondary mt-1 line-clamp-1">
              {user.bio}
            </p>
          )}
        </Link>

        {showFollowButton && !isOwnProfile && (
          <FollowButton
            userId={user.id}
            initialState={isFollowing ? "following" : "none"}
            size="sm"
            onStateChange={handleFollowChange}
          />
        )}

        {isOwnProfile && (
          <span className="px-3 py-1.5 text-sm text-text-secondary bg-bg-highlight rounded-full">
            You
          </span>
        )}
      </div>
    </motion.div>
  );
}
