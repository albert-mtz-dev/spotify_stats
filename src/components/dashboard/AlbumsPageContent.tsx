"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/components/motion/presets";
import { AlbumGrid } from "@/components/ui/AlbumGrid";
import { TimeRangeSelector } from "@/components/ui/TimeRangeSelector";
import type { AlbumSummary, TimeRange } from "@/lib/types";

interface Props {
  albums: {
    shortTerm: AlbumSummary[];
    mediumTerm: AlbumSummary[];
    longTerm: AlbumSummary[];
  };
}

export function AlbumsPageContent({ albums }: Props) {
  const [timeRange, setTimeRange] = useState<TimeRange>("medium_term");

  const currentAlbums =
    timeRange === "short_term"
      ? albums.shortTerm
      : timeRange === "medium_term"
        ? albums.mediumTerm
        : albums.longTerm;

  return (
    <motion.div
      className="space-y-6"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        variants={fadeInUp}
      >
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Top Albums</h2>
          <p className="text-text-secondary">
            Your most listened to albums based on your top tracks
          </p>
        </div>
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
      </motion.div>

      {currentAlbums.length > 0 ? (
        <motion.div variants={fadeInUp}>
          <AlbumGrid albums={currentAlbums} />
        </motion.div>
      ) : (
        <motion.div
          variants={fadeInUp}
          className="text-center py-12 text-text-secondary"
        >
          <p>No album data available for this time range.</p>
        </motion.div>
      )}
    </motion.div>
  );
}
