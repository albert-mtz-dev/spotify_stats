import posthog from "posthog-js";
import { AnalyticsEvents } from "./events";
import type {
  TimeRange,
  DashboardSection,
  ShareableContent,
  ErrorCategory,
  ArtistClickedProperties,
  TrackClickedProperties,
} from "./types";

/**
 * Analytics tracker for Spotify Mirror
 *
 * Usage:
 * import { analytics } from "@/services/analytics";
 * analytics.trackDashboardViewed({ time_range: "short_term", has_data: true });
 */

class AnalyticsTracker {
  // ============================================
  // AUTH TRACKING
  // ============================================

  trackSignIn(isFirstTime: boolean = false) {
    posthog.capture(AnalyticsEvents.USER_SIGNED_IN, {
      method: "spotify",
      is_first_time: isFirstTime,
    });

    if (isFirstTime) {
      posthog.capture(AnalyticsEvents.USER_FIRST_VISIT);
    }
  }

  trackSignOut(sessionDurationSeconds?: number) {
    posthog.capture(AnalyticsEvents.USER_SIGNED_OUT, {
      session_duration_seconds: sessionDurationSeconds,
    });
  }

  // ============================================
  // DASHBOARD TRACKING
  // ============================================

  trackDashboardViewed(props: {
    time_range: TimeRange;
    has_data: boolean;
    artist_count?: number;
    track_count?: number;
  }) {
    posthog.capture(AnalyticsEvents.DASHBOARD_VIEWED, props);
  }

  trackDataRefresh(props: {
    trigger: "manual" | "automatic";
    success: boolean;
    duration_ms?: number;
  }) {
    posthog.capture(AnalyticsEvents.DASHBOARD_DATA_REFRESHED, props);
  }

  trackDashboardLoading(phase: "started" | "completed", durationMs?: number) {
    const event =
      phase === "started"
        ? AnalyticsEvents.DASHBOARD_LOADING_STARTED
        : AnalyticsEvents.DASHBOARD_LOADING_COMPLETED;

    posthog.capture(event, {
      duration_ms: durationMs,
    });
  }

  // ============================================
  // CONTENT INTERACTION TRACKING
  // ============================================

  trackArtistClicked(props: Omit<ArtistClickedProperties, "timestamp" | "session_id">) {
    posthog.capture(AnalyticsEvents.ARTIST_CLICKED, props);

    if (props.destination === "spotify") {
      posthog.capture(AnalyticsEvents.ARTIST_SPOTIFY_OPENED, {
        artist_id: props.artist_id,
        artist_name: props.artist_name,
      });
    }
  }

  trackTrackClicked(props: Omit<TrackClickedProperties, "timestamp" | "session_id">) {
    posthog.capture(AnalyticsEvents.TRACK_CLICKED, props);

    if (props.destination === "spotify") {
      posthog.capture(AnalyticsEvents.TRACK_SPOTIFY_OPENED, {
        track_id: props.track_id,
        track_name: props.track_name,
      });
    }
  }

  trackGenreClicked(genreName: string, percentage?: number) {
    posthog.capture(AnalyticsEvents.GENRE_CLICKED, {
      genre_name: genreName,
      percentage,
    });
  }

  trackBadgeViewed(badgeId: string, badgeName: string, category?: string) {
    posthog.capture(AnalyticsEvents.BADGE_VIEWED, {
      badge_id: badgeId,
      badge_name: badgeName,
      badge_category: category,
    });
  }

  trackBadgeDetailsOpened(badgeId: string, badgeName: string) {
    posthog.capture(AnalyticsEvents.BADGE_DETAILS_OPENED, {
      badge_id: badgeId,
      badge_name: badgeName,
    });
  }

  // ============================================
  // NAVIGATION TRACKING
  // ============================================

  trackTimeRangeChanged(fromRange: TimeRange, toRange: TimeRange, section: DashboardSection) {
    posthog.capture(AnalyticsEvents.TIME_RANGE_CHANGED, {
      from_range: fromRange,
      to_range: toRange,
      section,
    });
  }

  trackSectionViewed(section: DashboardSection, timeRange: TimeRange) {
    posthog.capture(AnalyticsEvents.SECTION_VIEWED, {
      section,
      time_range: timeRange,
    });
  }

  trackSidebarNavClicked(destination: string) {
    posthog.capture(AnalyticsEvents.SIDEBAR_NAV_CLICKED, {
      destination,
    });
  }

  // ============================================
  // FEATURE TRACKING
  // ============================================

  trackShareClicked(contentType: ShareableContent, contentId?: string) {
    posthog.capture(AnalyticsEvents.SHARE_CLICKED, {
      content_type: contentType,
      content_id: contentId,
    });
  }

  trackShareCompleted(
    contentType: ShareableContent,
    shareMethod: "clipboard" | "native" | "twitter" | "other"
  ) {
    posthog.capture(AnalyticsEvents.SHARE_COMPLETED, {
      content_type: contentType,
      share_method: shareMethod,
    });
  }

  trackChartInteraction(
    chartType: "genres" | "activity_heatmap" | "listening_time",
    interaction: "hover" | "click" | "zoom",
    dataPoint?: string
  ) {
    posthog.capture(AnalyticsEvents.CHART_INTERACTED, {
      chart_type: chartType,
      interaction,
      data_point: dataPoint,
    });
  }

  trackListeningPatternsViewed() {
    posthog.capture(AnalyticsEvents.LISTENING_PATTERNS_VIEWED);
  }

  // ============================================
  // ERROR TRACKING
  // ============================================

  trackError(
    category: ErrorCategory,
    errorMessage: string,
    errorCode?: string,
    component?: string
  ) {
    posthog.capture(AnalyticsEvents.ERROR_OCCURRED, {
      category,
      error_message: errorMessage,
      error_code: errorCode,
      component,
    });
  }

  trackSyncFailed(errorMessage: string, errorCode?: string) {
    posthog.capture(AnalyticsEvents.SYNC_FAILED, {
      error_message: errorMessage,
      error_code: errorCode,
    });

    // Also track as general error
    this.trackError("sync", errorMessage, errorCode, "sync");
  }

  trackApiError(endpoint: string, statusCode: number, errorMessage: string) {
    posthog.capture(AnalyticsEvents.API_ERROR, {
      endpoint,
      status_code: statusCode,
      error_message: errorMessage,
    });

    // Also track as general error
    this.trackError("api", errorMessage, String(statusCode), endpoint);
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Track a custom event not covered by the predefined methods
   */
  trackCustom(eventName: string, properties?: Record<string, unknown>) {
    posthog.capture(eventName, properties);
  }

  /**
   * Set user properties that persist across sessions
   */
  setUserProperties(properties: Record<string, unknown>) {
    posthog.people.set(properties);
  }

  /**
   * Increment a numeric user property
   */
  incrementUserProperty(property: string, value: number = 1) {
    posthog.people.set_once({ [property]: 0 }); // Initialize if not exists
    (posthog.people as unknown as { increment: (prop: string, val: number) => void }).increment(property, value);
  }
}

// Export singleton instance
export const analytics = new AnalyticsTracker();
