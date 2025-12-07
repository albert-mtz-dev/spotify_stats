"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { staggerContainer, fadeInUp, scaleOnHover } from "@/components/motion/presets";
import type { ArtistSummary } from "@/lib/types";

interface ArtistGridProps {
  artists: ArtistSummary[];
}

export function ArtistGrid({ artists }: ArtistGridProps) {
  return (
    <motion.div
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {artists.map((artist, index) => (
        <motion.a
          key={artist.id}
          href={artist.spotifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group"
          variants={fadeInUp}
          transition={{ duration: 0.2, delay: index * 0.05 }}
        >
          <motion.div
            className="bg-bg-highlight rounded-xl p-3 cursor-pointer"
            variants={scaleOnHover}
            initial="rest"
            whileHover="hover"
          >
            <div className="relative aspect-square mb-3 rounded-lg overflow-hidden bg-bg-main">
              {artist.imageUrl ? (
                <Image
                  src={artist.imageUrl}
                  alt={artist.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-secondary">
                  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                </div>
              )}
            </div>
            <h4 className="font-medium text-text-primary text-sm truncate group-hover:text-accent transition-colors">
              {artist.name}
            </h4>
            <p className="text-xs text-text-secondary truncate">
              {artist.genres.slice(0, 2).join(", ") || "Artist"}
            </p>
          </motion.div>
        </motion.a>
      ))}
    </motion.div>
  );
}
