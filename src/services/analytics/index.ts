/**
 * Analytics Service for Spotify Mirror
 *
 * Centralized analytics tracking using PostHog.
 *
 * Usage:
 *
 * // Direct tracking
 * import { analytics } from "@/services/analytics";
 * analytics.trackArtistClicked({ artist_id: "123", artist_name: "Artist", ... });
 *
 * // React hooks
 * import { useAnalytics, useTrackSectionView } from "@/services/analytics";
 * const analytics = useAnalytics();
 * useTrackSectionView("artists", "short_term");
 *
 * // Event constants (for custom tracking)
 * import { AnalyticsEvents } from "@/services/analytics";
 */

// Core tracker
export { analytics } from "./tracker";

// Event constants
export { AnalyticsEvents } from "./events";
export type { AnalyticsEventName } from "./events";

// React hooks
export {
  useAnalytics,
  useTrackSectionView,
  useTrackDashboardView,
  useTrackLoadingTime,
  useTrackTimeRangeChange,
  useTrackDataRefresh,
} from "./hooks";

// Types
export type {
  TimeRange,
  DashboardSection,
  ShareableContent,
  ErrorCategory,
  BaseEventProperties,
  SignInEventProperties,
  SignOutEventProperties,
  DashboardViewedProperties,
  DataRefreshProperties,
  ArtistClickedProperties,
  TrackClickedProperties,
  GenreClickedProperties,
  BadgeViewedProperties,
  TimeRangeChangedProperties,
  SectionViewedProperties,
  ShareClickedProperties,
  ChartInteractionProperties,
  ErrorOccurredProperties,
  EventProperties,
} from "./types";
