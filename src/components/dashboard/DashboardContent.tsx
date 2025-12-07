"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { staggerContainer, fadeInUp } from "@/components/motion/presets";
import { StatCard } from "@/components/ui/StatCard";
import { ArtistGrid } from "@/components/ui/ArtistGrid";
import { TrackList } from "@/components/ui/TrackList";
import { AlbumGrid } from "@/components/ui/AlbumGrid";
import { GenreChart } from "@/components/charts/GenreChart";
import { ActivityHeatmap } from "@/components/charts/ActivityHeatmap";
import { BadgeGrid } from "@/components/ui/BadgeGrid";
import { TimeRangeSelector } from "@/components/ui/TimeRangeSelector";
import { ProfileVisibilityNotice } from "@/components/ui/ProfileVisibilityNotice";
import { ShareProfileButton } from "@/components/ui/ShareProfileButton";
import { RefreshButton } from "@/components/ui/RefreshButton";
import { formatDuration } from "@/lib/analytics";
import type { DashboardData, TimeRange } from "@/lib/types";

interface Props {
  data: DashboardData;
  showVisibilityNotice?: boolean;
  userId?: string;
  username?: string | null;
}

export function DashboardContent({ data, showVisibilityNotice = false, userId, username }: Props) {
  const [timeRange, setTimeRange] = useState<TimeRange>("medium_term");
  const [showNotice, setShowNotice] = useState(showVisibilityNotice);

  const artists =
    timeRange === "short_term"
      ? data.topArtists.shortTerm
      : timeRange === "medium_term"
        ? data.topArtists.mediumTerm
        : data.topArtists.longTerm;

  const tracks =
    timeRange === "short_term"
      ? data.topTracks.shortTerm
      : timeRange === "medium_term"
        ? data.topTracks.mediumTerm
        : data.topTracks.longTerm;

  const albums =
    timeRange === "short_term"
      ? data.topAlbums.shortTerm
      : timeRange === "medium_term"
        ? data.topAlbums.mediumTerm
        : data.topAlbums.longTerm;

  const handleDismissNotice = async () => {
    await fetch("/api/user/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hasSeenVisibilityNotice: true }),
    });
    setShowNotice(false);
  };

  const handleGoPrivate = async () => {
    await fetch("/api/user/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profileVisibility: "PRIVATE",
        hasSeenVisibilityNotice: true,
      }),
    });
    setShowNotice(false);
  };

  return (
    <>
      {showNotice && (
        <ProfileVisibilityNotice
          onDismiss={handleDismissNotice}
          onGoPrivate={handleGoPrivate}
        />
      )}
    <motion.div
      className="space-y-8"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Welcome Section */}
      <motion.div variants={fadeInUp} transition={{ duration: 0.2 }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-text-primary mb-2">
              Welcome back, {data.user.name?.split(" ")[0]}!
            </h2>
            <p className="text-text-secondary">
              Here&apos;s your personalized music profile based on your Spotify
              listening history.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <RefreshButton />
            {userId && <ShareProfileButton userId={userId} username={username} />}
          </div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        variants={fadeInUp}
        transition={{ duration: 0.2, delay: 0.1 }}
      >
        <StatCard
          label="Listening Time"
          value={formatDuration(data.stats.totalListeningTimeMs)}
          subtitle="Last 50 tracks"
        />
        <StatCard
          label="Top Artists"
          value={data.stats.uniqueArtists.toString()}
          subtitle="Unique artists"
        />
        <StatCard
          label="Top Tracks"
          value={data.stats.uniqueTracks.toString()}
          subtitle="Unique tracks"
        />
        <StatCard
          label="Top Genre"
          value={data.stats.topGenre || "N/A"}
          subtitle="Most listened"
        />
      </motion.div>

      {/* Time Range Selector */}
      <motion.div
        variants={fadeInUp}
        transition={{ duration: 0.2, delay: 0.2 }}
      >
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
      </motion.div>

      {/* Top Artists */}
      <motion.section
        variants={fadeInUp}
        transition={{ duration: 0.2, delay: 0.3 }}
      >
        <h3 className="text-xl font-semibold text-text-primary mb-4">
          Top Artists
        </h3>
        <ArtistGrid artists={artists.slice(0, 10)} />
      </motion.section>

      {/* Top Tracks */}
      <motion.section
        variants={fadeInUp}
        transition={{ duration: 0.2, delay: 0.4 }}
      >
        <h3 className="text-xl font-semibold text-text-primary mb-4">
          Top Tracks
        </h3>
        <TrackList tracks={tracks.slice(0, 10)} />
      </motion.section>

      {/* Top Albums */}
      {albums.length > 0 && (
        <motion.section
          variants={fadeInUp}
          transition={{ duration: 0.2, delay: 0.45 }}
        >
          <h3 className="text-xl font-semibold text-text-primary mb-4">
            Top Albums
          </h3>
          <AlbumGrid albums={albums.slice(0, 10)} />
        </motion.section>
      )}

      {/* Charts Row */}
      <motion.div
        className="grid md:grid-cols-2 gap-6"
        variants={fadeInUp}
        transition={{ duration: 0.2, delay: 0.5 }}
      >
        <div className="bg-bg-elevated rounded-xl border border-border-subtle p-6">
          <h3 className="text-xl font-semibold text-text-primary mb-4">
            Genre Breakdown
          </h3>
          <GenreChart genres={data.genres} />
        </div>

        <div className="bg-bg-elevated rounded-xl border border-border-subtle p-6">
          <h3 className="text-xl font-semibold text-text-primary mb-4">
            Listening Activity
          </h3>
          <ActivityHeatmap patterns={data.listeningPatterns} />
        </div>
      </motion.div>

      {/* Badges */}
      {data.badges.length > 0 && (
        <motion.section
          variants={fadeInUp}
          transition={{ duration: 0.2, delay: 0.6 }}
        >
          <h3 className="text-xl font-semibold text-text-primary mb-4">
            Your Badges
          </h3>
          <BadgeGrid badges={data.badges} />
        </motion.section>
      )}
    </motion.div>
    </>
  );
}
