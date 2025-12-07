"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { UserSearchResult } from "@/lib/types";

interface UserCardProps {
  user: UserSearchResult;
}

export function UserCard({ user }: UserCardProps) {
  const profileUrl = `/u/${user.username || user.id}`;

  return (
    <Link href={profileUrl}>
      <motion.div
        className="bg-bg-elevated rounded-xl border border-border-subtle p-4 hover:border-accent/50 transition-colors"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.15 }}
      >
        <div className="flex items-center gap-4">
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

          <div className="flex-1 min-w-0">
            <p className="font-medium text-text-primary truncate">{user.name}</p>
            {user.username && (
              <p className="text-sm text-text-secondary">@{user.username}</p>
            )}
            {user.bio && (
              <p className="text-sm text-text-secondary mt-1 line-clamp-2">
                {user.bio}
              </p>
            )}
          </div>

          <svg
            className="w-5 h-5 text-text-secondary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </motion.div>
    </Link>
  );
}
