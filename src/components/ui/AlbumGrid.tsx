"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { staggerContainer, fadeInUp, scaleOnHover } from "@/components/motion/presets";
import type { AlbumSummary } from "@/lib/types";

interface AlbumGridProps {
  albums: AlbumSummary[];
}

export function AlbumGrid({ albums }: AlbumGridProps) {
  return (
    <motion.div
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {albums.map((album, index) => (
        <motion.a
          key={album.id}
          href={album.spotifyUrl}
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
            <div className="relative aspect-square mb-3 rounded-lg overflow-hidden bg-bg-main shadow-lg">
              {album.imageUrl ? (
                <Image
                  src={album.imageUrl}
                  alt={album.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-secondary">
                  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                  </svg>
                </div>
              )}
            </div>
            <h4 className="font-medium text-text-primary text-sm truncate group-hover:text-accent transition-colors">
              {album.name}
            </h4>
            <p className="text-xs text-text-secondary truncate">
              {album.artistNames.join(", ")}
            </p>
            <p className="text-xs text-text-secondary mt-1">
              {album.trackCount} {album.trackCount === 1 ? "track" : "tracks"} in your top
            </p>
          </motion.div>
        </motion.a>
      ))}
    </motion.div>
  );
}
