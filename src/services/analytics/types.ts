/**
 * Analytics event type definitions for Spotify Mirror
 */

// Time range options from Spotify API
export type TimeRange = "short_term" | "medium_term" | "long_term";

// Dashboard sections/tabs
export type DashboardSection = "overview" | "artists" | "tracks" | "genres" | "activity" | "badges";

// Content types that can be shared
export type ShareableContent = "profile" | "artist" | "track" | "stats";

// Error categories for tracking
export type ErrorCategory = "sync" | "auth" | "api" | "render";

// Base event properties included with every event
export interface BaseEventProperties {
  timestamp?: string;
  session_id?: string;
}

// Auth events
export interface SignInEventProperties extends BaseEventProperties {
  method: "spotify";
  is_first_time?: boolean;
}

export interface SignOutEventProperties extends BaseEventProperties {
  session_duration_seconds?: number;
}

// Dashboard events
export interface DashboardViewedProperties extends BaseEventProperties {
  time_range: TimeRange;
  has_data: boolean;
  artist_count?: number;
  track_count?: number;
}

export interface DataRefreshProperties extends BaseEventProperties {
  trigger: "manual" | "automatic";
  success: boolean;
  duration_ms?: number;
}

// Content interaction events
export interface ArtistClickedProperties extends BaseEventProperties {
  artist_id: string;
  artist_name: string;
  rank?: number;
  time_range: TimeRange;
  destination: "detail" | "spotify";
}

export interface TrackClickedProperties extends BaseEventProperties {
  track_id: string;
  track_name: string;
  artist_name: string;
  rank?: number;
  time_range: TimeRange;
  destination: "detail" | "spotify";
}

export interface GenreClickedProperties extends BaseEventProperties {
  genre_name: string;
  percentage?: number;
}

export interface BadgeViewedProperties extends BaseEventProperties {
  badge_id: string;
  badge_name: string;
  badge_category?: string;
}

// Navigation events
export interface TimeRangeChangedProperties extends BaseEventProperties {
  from_range: TimeRange;
  to_range: TimeRange;
  section: DashboardSection;
}

export interface SectionViewedProperties extends BaseEventProperties {
  section: DashboardSection;
  time_range: TimeRange;
}

// Feature events
export interface ShareClickedProperties extends BaseEventProperties {
  content_type: ShareableContent;
  content_id?: string;
  share_method?: "clipboard" | "native" | "twitter" | "other";
}

export interface ChartInteractionProperties extends BaseEventProperties {
  chart_type: "genres" | "activity_heatmap" | "listening_time";
  interaction: "hover" | "click" | "zoom";
  data_point?: string;
}

// Error events
export interface ErrorOccurredProperties extends BaseEventProperties {
  category: ErrorCategory;
  error_message: string;
  error_code?: string;
  component?: string;
}

// Union type of all event properties
export type EventProperties =
  | SignInEventProperties
  | SignOutEventProperties
  | DashboardViewedProperties
  | DataRefreshProperties
  | ArtistClickedProperties
  | TrackClickedProperties
  | GenreClickedProperties
  | BadgeViewedProperties
  | TimeRangeChangedProperties
  | SectionViewedProperties
  | ShareClickedProperties
  | ChartInteractionProperties
  | ErrorOccurredProperties;
