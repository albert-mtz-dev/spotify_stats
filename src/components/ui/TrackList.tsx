"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { staggerContainer, fadeInUp } from "@/components/motion/presets";
import type { TrackSummary } from "@/lib/types";

interface TrackListProps {
  tracks: TrackSummary[];
}

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function TrackList({ tracks }: TrackListProps) {
  return (
    <motion.div
      className="bg-bg-elevated rounded-xl border border-border-subtle overflow-hidden"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {tracks.map((track, index) => (
        <motion.a
          key={track.id}
          href={track.spotifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 p-3 hover:bg-bg-highlight transition-colors group"
          variants={fadeInUp}
          transition={{ duration: 0.15, delay: index * 0.03 }}
        >
          {/* Track number */}
          <span className="w-6 text-center text-sm text-text-secondary">
            {index + 1}
          </span>

          {/* Album art */}
          <div className="relative w-10 h-10 rounded overflow-hidden bg-bg-main flex-shrink-0">
            {track.albumImageUrl ? (
              <Image
                src={track.albumImageUrl}
                alt={track.albumName}
                fill
                className="object-cover"
                sizes="40px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text-secondary">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                </svg>
              </div>
            )}
          </div>

          {/* Track info */}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-text-primary truncate group-hover:text-accent transition-colors">
              {track.name}
            </p>
            <p className="text-sm text-text-secondary truncate">
              {track.artistNames.join(", ")}
            </p>
          </div>

          {/* Album name (hidden on mobile) */}
          <div className="hidden md:block flex-1 min-w-0">
            <p className="text-sm text-text-secondary truncate">
              {track.albumName}
            </p>
          </div>

          {/* Duration */}
          <span className="text-sm text-text-secondary">
            {formatDuration(track.durationMs)}
          </span>
        </motion.a>
      ))}
    </motion.div>
  );
}
