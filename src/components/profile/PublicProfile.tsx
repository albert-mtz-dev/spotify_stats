"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { fadeInUp, staggerContainer } from "@/components/motion/presets";
import { FollowButton } from "@/components/social/FollowButton";
import type { PublicProfileData } from "@/lib/types";
import { formatDistanceToNow } from "@/lib/utils";

interface PublicProfileProps {
  profile: PublicProfileData;
  isOwner: boolean;
}

export function PublicProfile({ profile, isOwner }: PublicProfileProps) {
  const { user, stats, viewerRelationship } = profile;

  // Determine initial follow state
  const getInitialFollowState = (): "none" | "following" | "pending" | "follow_back" => {
    if (viewerRelationship?.isFollowing) return "following";
    if (viewerRelationship?.hasPendingRequest) return "pending";
    if (viewerRelationship?.isFollowedBy) return "follow_back";
    return "none";
  };

  return (
    <motion.div
      className="max-w-4xl mx-auto px-6 py-8"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Profile Header */}
      <motion.div
        className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-10"
        variants={fadeInUp}
      >
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name}
            width={128}
            height={128}
            className="w-32 h-32 rounded-full border-4 border-accent"
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-bg-highlight flex items-center justify-center border-4 border-accent">
            <span className="text-4xl font-bold text-text-secondary">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        <div className="text-center md:text-left flex-1">
          <h1 className="text-3xl font-bold text-text-primary">{user.name}</h1>
          {user.username && (
            <p className="text-text-secondary mt-1">@{user.username}</p>
          )}
          {user.bio && (
            <p className="text-text-secondary mt-3 max-w-lg">{user.bio}</p>
          )}
          {user.lastSyncedAt && (
            <p className="text-xs text-text-secondary mt-3">
              Last updated {formatDistanceToNow(new Date(user.lastSyncedAt))}
            </p>
          )}
          {isOwner ? (
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 mt-4 text-sm text-accent hover:underline"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                  clipRule="evenodd"
                />
              </svg>
              Edit Profile
            </Link>
          ) : viewerRelationship && (
            <div className="mt-4">
              <FollowButton
                userId={user.id}
                initialState={getInitialFollowState()}
                isFollowedBy={viewerRelationship.isFollowedBy}
              />
            </div>
          )}
        </div>
      </motion.div>

      {/* No Data State */}
      {stats.topArtists.length === 0 && stats.topTracks.length === 0 && (
        <motion.div
          className="bg-bg-elevated rounded-xl border border-border-subtle p-8 text-center"
          variants={fadeInUp}
        >
          <p className="text-text-secondary">
            {isOwner
              ? "No music data yet. Visit your dashboard to sync your Spotify stats!"
              : "This user hasn't synced their music data yet."}
          </p>
          {isOwner && (
            <Link
              href="/dashboard"
              className="inline-block mt-4 px-6 py-2 bg-accent text-black font-semibold rounded-full hover:bg-accent-soft transition-colors"
            >
              Go to Dashboard
            </Link>
          )}
        </motion.div>
      )}

      {/* Top Genres */}
      {stats.topGenres.length > 0 && (
        <motion.section className="mb-10" variants={fadeInUp}>
          <h2 className="text-xl font-semibold text-text-primary mb-4">
            Top Genres
          </h2>
          <div className="flex flex-wrap gap-2">
            {stats.topGenres.map((genre) => (
              <span
                key={genre}
                className="px-4 py-2 bg-accent/10 border border-accent/20 rounded-full text-sm text-accent capitalize"
              >
                {genre}
              </span>
            ))}
          </div>
        </motion.section>
      )}

      {/* Top Artists */}
      {stats.topArtists.length > 0 && (
        <motion.section className="mb-10" variants={fadeInUp}>
          <h2 className="text-xl font-semibold text-text-primary mb-4">
            Top Artists
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {stats.topArtists.map((artist, index) => (
              <motion.a
                key={artist.id}
                href={artist.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-bg-elevated rounded-xl border border-border-subtle p-4 hover:border-accent/50 transition-colors group"
                whileHover={{ scale: 1.02 }}
              >
                {artist.imageUrl ? (
                  <Image
                    src={artist.imageUrl}
                    alt={artist.name}
                    width={120}
                    height={120}
                    className="w-full aspect-square rounded-lg object-cover mb-3"
                  />
                ) : (
                  <div className="w-full aspect-square rounded-lg bg-bg-highlight flex items-center justify-center mb-3">
                    <span className="text-2xl font-bold text-text-secondary">
                      {artist.name.charAt(0)}
                    </span>
                  </div>
                )}
                <p className="text-sm font-medium text-text-primary truncate group-hover:text-accent transition-colors">
                  {artist.name}
                </p>
                <p className="text-xs text-text-secondary">#{index + 1}</p>
              </motion.a>
            ))}
          </div>
        </motion.section>
      )}

      {/* Top Tracks */}
      {stats.topTracks.length > 0 && (
        <motion.section className="mb-10" variants={fadeInUp}>
          <h2 className="text-xl font-semibold text-text-primary mb-4">
            Top Tracks
          </h2>
          <div className="bg-bg-elevated rounded-xl border border-border-subtle divide-y divide-border-subtle">
            {stats.topTracks.map((track, index) => (
              <a
                key={track.id}
                href={track.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 hover:bg-bg-highlight/50 transition-colors group"
              >
                <span className="w-6 text-text-secondary text-sm">
                  {index + 1}
                </span>
                {track.albumImageUrl ? (
                  <Image
                    src={track.albumImageUrl}
                    alt={track.albumName}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded"
                  />
                ) : (
                  <div className="w-12 h-12 rounded bg-bg-highlight" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-text-primary font-medium truncate group-hover:text-accent transition-colors">
                    {track.name}
                  </p>
                  <p className="text-sm text-text-secondary truncate">
                    {track.artistNames.join(", ")}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </motion.section>
      )}

      {/* Badges */}
      {stats.badges.length > 0 && (
        <motion.section variants={fadeInUp}>
          <h2 className="text-xl font-semibold text-text-primary mb-4">
            Badges
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {stats.badges.map((badge) => (
              <div
                key={badge.id}
                className="bg-bg-elevated rounded-xl border border-border-subtle p-4 text-center"
              >
                <span className="text-3xl">{badge.icon}</span>
                <p className="text-sm font-medium text-text-primary mt-2">
                  {badge.name}
                </p>
                <p className="text-xs text-text-secondary mt-1">
                  {badge.description}
                </p>
              </div>
            ))}
          </div>
        </motion.section>
      )}
    </motion.div>
  );
}
