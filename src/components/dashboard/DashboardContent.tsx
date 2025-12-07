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
import {
  DecadeChart,
  AudioFeaturesRadar,
  ListeningByDayChart,
  ListeningByHourChart,
  CumulativeListeningChart,
  PopularityChart,
} from "@/components/charts";
import { BadgeGrid } from "@/components/ui/BadgeGrid";
import { TimeRangeSelector } from "@/components/ui/TimeRangeSelector";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";
import { ShareProfileButton } from "@/components/ui/ShareProfileButton";
import { RefreshButton } from "@/components/ui/RefreshButton";
import { formatDuration } from "@/lib/analytics";
import type { DashboardData, TimeRange } from "@/lib/types";

// Helper to format hour to readable time
function formatHour(hour: number): string {
  if (hour === 0) return "12 AM";
  if (hour === 12) return "12 PM";
  return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
}

// Helper to format song length
function formatSongLength(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

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

  const handleOnboardingComplete = () => {
    setShowNotice(false);
  };

  return (
    <>
      {showNotice && (
        <OnboardingModal onComplete={handleOnboardingComplete} />
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
            <h2 className="text-2xl lg:text-3xl font-bold text-text-primary mb-2">
              Welcome back, {data.user.name?.split(" ")[0]}!
            </h2>
            <p className="text-sm lg:text-base text-text-secondary">
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

      {/* Overview Stats */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        variants={fadeInUp}
        transition={{ duration: 0.2, delay: 0.1 }}
      >
        <StatCard
          label="Listening Time"
          value={formatDuration(data.stats.totalListeningTimeMs)}
          subtitle="Last 50 tracks"
          variant="time"
        />
        <StatCard
          label="Top Artists"
          value={data.stats.uniqueArtists.toString()}
          subtitle="Unique artists"
          variant="artists"
        />
        <StatCard
          label="Top Tracks"
          value={data.stats.uniqueTracks.toString()}
          subtitle="Unique tracks"
          variant="tracks"
        />
        <StatCard
          label="Top Genre"
          value={data.stats.topGenre || "N/A"}
          subtitle="Most listened"
          variant="genre"
        />
      </motion.div>

      {/* Music Profile Stats */}
      <motion.section variants={fadeInUp} transition={{ duration: 0.2, delay: 0.15 }}>
        <h3 className="text-xl font-semibold text-text-primary mb-4">Your Music Profile</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <StatCard
            label="Mainstream Score"
            value={`${data.extendedStats.mainstreamScore}%`}
            subtitle={data.extendedStats.mainstreamScore > 60 ? "Popular taste" : data.extendedStats.mainstreamScore > 40 ? "Balanced mix" : "Indie explorer"}
            variant="mainstream"
          />
          <StatCard
            label="Avg Song Length"
            value={formatSongLength(data.extendedStats.avgSongLengthMs)}
            subtitle="Per track"
            variant="songLength"
          />
          <StatCard
            label="Genre Diversity"
            value={data.extendedStats.genreDiversity.toString()}
            subtitle="Unique genres"
            variant="diversity"
          />
          <StatCard
            label="Peak Hour"
            value={formatHour(data.extendedStats.peakListeningHour)}
            subtitle="Most active"
            variant="peakHour"
          />
          <StatCard
            label="Top Day"
            value={data.extendedStats.mostActiveDay}
            subtitle="Most listens"
            variant="activeDay"
          />
        </div>
      </motion.section>

      {/* Audio Features Stats */}
      {data.extendedStats.hasAudioFeatures ? (
        <motion.section variants={fadeInUp} transition={{ duration: 0.2, delay: 0.18 }}>
          <h3 className="text-xl font-semibold text-text-primary mb-4">Sound Profile</h3>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 content-start">
              <StatCard
                label="Energy"
                value={`${data.extendedStats.energyScore}%`}
                subtitle={data.extendedStats.energyScore > 70 ? "High energy" : data.extendedStats.energyScore > 40 ? "Balanced" : "Chill vibes"}
                variant="energy"
              />
              <StatCard
                label="Danceability"
                value={`${data.extendedStats.danceabilityScore}%`}
                subtitle={data.extendedStats.danceabilityScore > 70 ? "Dance floor ready" : data.extendedStats.danceabilityScore > 40 ? "Moderate groove" : "Head-nodder"}
                variant="danceability"
              />
              <StatCard
                label="Mood"
                value={`${data.extendedStats.moodScore}%`}
                subtitle={data.extendedStats.moodScore > 60 ? "Upbeat & happy" : data.extendedStats.moodScore > 40 ? "Mixed feels" : "Melancholic"}
                variant="mood"
              />
              <StatCard
                label="Acoustic"
                value={`${data.extendedStats.acousticScore}%`}
                subtitle={data.extendedStats.acousticScore > 50 ? "Organic sound" : "Electronic"}
                variant="acoustic"
              />
              <StatCard
                label="Avg Tempo"
                value={`${data.extendedStats.avgTempo}`}
                subtitle="BPM"
                variant="tempo"
              />
            </div>
            <div className="bg-bg-elevated rounded-xl border border-border-subtle p-6">
              <h4 className="text-sm font-medium text-text-secondary mb-4">Audio DNA</h4>
              <AudioFeaturesRadar
                energy={data.extendedStats.energyScore}
                danceability={data.extendedStats.danceabilityScore}
                mood={data.extendedStats.moodScore}
                acoustic={data.extendedStats.acousticScore}
                tempo={data.extendedStats.avgTempo}
              />
            </div>
          </div>
        </motion.section>
      ) : (
        <motion.section variants={fadeInUp} transition={{ duration: 0.2, delay: 0.18 }}>
          <h3 className="text-xl font-semibold text-text-primary mb-4">Sound Profile</h3>
          <div className="bg-bg-elevated rounded-xl border border-border-subtle p-6 text-center">
            <p className="text-text-secondary text-sm">
              Audio analysis unavailable. Sound profile features (energy, danceability, mood) require extended Spotify API access.
            </p>
          </div>
        </motion.section>
      )}

      {/* Discovery Stats */}
      <motion.section variants={fadeInUp} transition={{ duration: 0.2, delay: 0.2 }}>
        <h3 className="text-xl font-semibold text-text-primary mb-4">Listening Habits</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Loyalty Score"
            value={`${data.extendedStats.loyaltyScore}%`}
            subtitle={data.extendedStats.loyaltyScore > 60 ? "Faithful fan" : data.extendedStats.loyaltyScore > 30 ? "Mix of old & new" : "Always exploring"}
            variant="loyalty"
          />
          <StatCard
            label="Discovery Rate"
            value={`${data.extendedStats.discoveryRate}%`}
            subtitle="New artists recently"
            variant="discovery"
          />
          <StatCard
            label="Album Explorer"
            value={`${data.extendedStats.albumExplorerScore}%`}
            subtitle={data.extendedStats.albumExplorerScore > 70 ? "Deep diver" : data.extendedStats.albumExplorerScore > 40 ? "Album sampler" : "Singles fan"}
            variant="albumExplorer"
          />
          {data.extendedStats.decadeBreakdown[0] && (
            <StatCard
              label="Top Decade"
              value={data.extendedStats.decadeBreakdown[0].decade}
              subtitle={`${data.extendedStats.decadeBreakdown[0].percentage}% of tracks`}
              variant="decade"
            />
          )}
        </div>
      </motion.section>

      {/* Time Range Selector */}
      <motion.div
        variants={fadeInUp}
        transition={{ duration: 0.2, delay: 0.2 }}
      >
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
      </motion.div>

      {/* Top Tracks */}
      <motion.section
        variants={fadeInUp}
        transition={{ duration: 0.2, delay: 0.3 }}
      >
        <h3 className="text-xl font-semibold text-text-primary mb-4">
          Top Tracks
        </h3>
        <TrackList tracks={tracks.slice(0, 10)} />
      </motion.section>

      {/* Top Artists */}
      <motion.section
        variants={fadeInUp}
        transition={{ duration: 0.2, delay: 0.4 }}
      >
        <h3 className="text-xl font-semibold text-text-primary mb-4">
          Top Artists
        </h3>
        <ArtistGrid artists={artists.slice(0, 10)} />
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

      {/* Listening Patterns Section */}
      <motion.section variants={fadeInUp} transition={{ duration: 0.2, delay: 0.5 }}>
        <h3 className="text-xl font-semibold text-text-primary mb-4">When You Listen</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-bg-elevated rounded-xl border border-border-subtle p-6">
            <h4 className="text-sm font-medium text-text-secondary mb-4">By Hour of Day</h4>
            <ListeningByHourChart patterns={data.listeningPatterns} />
          </div>
          <div className="bg-bg-elevated rounded-xl border border-border-subtle p-6">
            <h4 className="text-sm font-medium text-text-secondary mb-4">By Day of Week</h4>
            <ListeningByDayChart patterns={data.listeningPatterns} />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <div className="bg-bg-elevated rounded-xl border border-border-subtle p-6">
            <h4 className="text-sm font-medium text-text-secondary mb-4">
              Cumulative by Hour
            </h4>
            <CumulativeListeningChart patterns={data.listeningPatterns} mode="hourly" />
          </div>
          <div className="bg-bg-elevated rounded-xl border border-border-subtle p-6">
            <h4 className="text-sm font-medium text-text-secondary mb-4">
              Cumulative by Day
            </h4>
            <CumulativeListeningChart patterns={data.listeningPatterns} mode="daily" />
          </div>
        </div>
      </motion.section>

      {/* Charts Row - Genres and Activity Heatmap */}
      <motion.div
        className="grid md:grid-cols-2 gap-6"
        variants={fadeInUp}
        transition={{ duration: 0.2, delay: 0.55 }}
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

      {/* Additional Charts Row - Decades and Popularity */}
      <motion.div
        className="grid md:grid-cols-2 gap-6"
        variants={fadeInUp}
        transition={{ duration: 0.2, delay: 0.6 }}
      >
        <div className="bg-bg-elevated rounded-xl border border-border-subtle p-6">
          <h3 className="text-xl font-semibold text-text-primary mb-4">
            Music by Decade
          </h3>
          <DecadeChart decadeBreakdown={data.extendedStats.decadeBreakdown} />
        </div>

        <div className="bg-bg-elevated rounded-xl border border-border-subtle p-6">
          <h3 className="text-xl font-semibold text-text-primary mb-4">
            Track Popularity
          </h3>
          <PopularityChart tracks={tracks} />
        </div>
      </motion.div>

      {/* Badges */}
      {data.badges.length > 0 && (
        <motion.section
          variants={fadeInUp}
          transition={{ duration: 0.2, delay: 0.65 }}
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
