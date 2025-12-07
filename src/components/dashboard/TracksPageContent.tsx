"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/components/motion/presets";
import { TrackList } from "@/components/ui/TrackList";
import { TimeRangeSelector } from "@/components/ui/TimeRangeSelector";
import type { TrackSummary, TimeRange } from "@/lib/types";

interface Props {
  tracks: {
    shortTerm: TrackSummary[];
    mediumTerm: TrackSummary[];
    longTerm: TrackSummary[];
  };
}

export function TracksPageContent({ tracks }: Props) {
  const [timeRange, setTimeRange] = useState<TimeRange>("medium_term");

  const currentTracks =
    timeRange === "short_term"
      ? tracks.shortTerm
      : timeRange === "medium_term"
        ? tracks.mediumTerm
        : tracks.longTerm;

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
          <h2 className="text-2xl font-bold text-text-primary">Top Tracks</h2>
          <p className="text-text-secondary">
            Your most played songs based on listening frequency
          </p>
        </div>
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
      </motion.div>

      <motion.div variants={fadeInUp}>
        <TrackList tracks={currentTracks} />
      </motion.div>
    </motion.div>
  );
}
