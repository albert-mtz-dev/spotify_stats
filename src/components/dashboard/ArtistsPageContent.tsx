"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/components/motion/presets";
import { ArtistGrid } from "@/components/ui/ArtistGrid";
import { TimeRangeSelector } from "@/components/ui/TimeRangeSelector";
import type { ArtistSummary, TimeRange } from "@/lib/types";

interface Props {
  artists: {
    shortTerm: ArtistSummary[];
    mediumTerm: ArtistSummary[];
    longTerm: ArtistSummary[];
  };
}

export function ArtistsPageContent({ artists }: Props) {
  const [timeRange, setTimeRange] = useState<TimeRange>("medium_term");

  const currentArtists =
    timeRange === "short_term"
      ? artists.shortTerm
      : timeRange === "medium_term"
        ? artists.mediumTerm
        : artists.longTerm;

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
          <h2 className="text-2xl font-bold text-text-primary">Top Artists</h2>
          <p className="text-text-secondary">
            Your most listened to artists based on listening frequency
          </p>
        </div>
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
      </motion.div>

      <motion.div variants={fadeInUp}>
        <ArtistGrid artists={currentArtists} />
      </motion.div>
    </motion.div>
  );
}
