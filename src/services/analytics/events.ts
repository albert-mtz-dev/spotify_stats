/**
 * Analytics event name constants
 *
 * Naming convention: {noun}_{verb} in snake_case
 * Examples: user_signed_in, dashboard_viewed, artist_clicked
 */

export const AnalyticsEvents = {
  // ============================================
  // AUTH EVENTS
  // Track authentication flow and user sessions
  // ============================================
  USER_SIGNED_IN: "user_signed_in",
  USER_SIGNED_OUT: "user_signed_out",
  USER_FIRST_VISIT: "user_first_visit",

  // ============================================
  // DASHBOARD EVENTS
  // Track core dashboard engagement
  // ============================================
  DASHBOARD_VIEWED: "dashboard_viewed",
  DASHBOARD_DATA_REFRESHED: "dashboard_data_refreshed",
  DASHBOARD_LOADING_STARTED: "dashboard_loading_started",
  DASHBOARD_LOADING_COMPLETED: "dashboard_loading_completed",

  // ============================================
  // CONTENT INTERACTION EVENTS
  // Track what users engage with
  // ============================================
  ARTIST_CLICKED: "artist_clicked",
  ARTIST_SPOTIFY_OPENED: "artist_spotify_opened",
  TRACK_CLICKED: "track_clicked",
  TRACK_SPOTIFY_OPENED: "track_spotify_opened",
  GENRE_CLICKED: "genre_clicked",
  BADGE_VIEWED: "badge_viewed",
  BADGE_DETAILS_OPENED: "badge_details_opened",

  // ============================================
  // NAVIGATION EVENTS
  // Track how users navigate the app
  // ============================================
  TIME_RANGE_CHANGED: "time_range_changed",
  SECTION_VIEWED: "section_viewed",
  SIDEBAR_NAV_CLICKED: "sidebar_nav_clicked",

  // ============================================
  // FEATURE EVENTS
  // Track feature adoption and usage
  // ============================================
  SHARE_CLICKED: "share_clicked",
  SHARE_COMPLETED: "share_completed",
  CHART_INTERACTED: "chart_interacted",
  LISTENING_PATTERNS_VIEWED: "listening_patterns_viewed",

  // ============================================
  // ERROR EVENTS
  // Track errors for reliability monitoring
  // ============================================
  ERROR_OCCURRED: "error_occurred",
  SYNC_FAILED: "sync_failed",
  API_ERROR: "api_error",
} as const;

// Type for event names
export type AnalyticsEventName = (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];
