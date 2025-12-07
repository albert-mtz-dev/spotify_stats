# Analytics Service

Centralized analytics tracking service for Spotify Mirror using PostHog.

## Table of Contents

- [Overview](#overview)
- [Structure](#structure)
- [Quick Start](#quick-start)
- [Events Tracked](#events-tracked)
  - [Authentication](#authentication)
  - [Dashboard](#dashboard)
  - [Content Interactions](#content-interactions)
  - [Navigation](#navigation)
  - [Features](#features)
  - [Errors](#errors)
- [React Hooks](#react-hooks)
  - [useAnalytics()](#useanalytics)
  - [useTrackSectionView()](#usetracksectionviewsection-timerange)
  - [useTrackDashboardView()](#usetrackdashboardviewprops)
  - [useTrackLoadingTime()](#usetrackloadingtime)
  - [useTrackTimeRangeChange()](#usetracktimerangechangesection)
  - [useTrackDataRefresh()](#usetrackdatarefresh)
- [Types](#types)
- [User Identification](#user-identification)
- [Custom Events](#custom-events)
- [User Properties](#user-properties)
- [Best Practices](#best-practices)

## Overview

This service provides a type-safe, consistent way to track user interactions throughout the app. It wraps PostHog's SDK with domain-specific methods tailored to Spotify Mirror's features.

## Structure

```
src/services/analytics/
├── index.ts      # Main exports - import everything from here
├── types.ts      # TypeScript interfaces for event properties
├── events.ts     # Event name constants
├── tracker.ts    # AnalyticsTracker class with tracking methods
├── hooks.ts      # React hooks for component-level tracking
└── README.md     # This file
```

## Quick Start

```typescript
// Import the analytics tracker
import { analytics } from "@/services/analytics";

// Track an event
analytics.trackArtistClicked({
  artist_id: "abc123",
  artist_name: "Taylor Swift",
  rank: 1,
  time_range: "short_term",
  destination: "spotify",
});
```

## Events Tracked

### Authentication
| Event | Method | Description |
|-------|--------|-------------|
| `user_signed_in` | `trackSignIn()` | User logged in via Spotify |
| `user_signed_out` | `trackSignOut()` | User logged out |
| `user_first_visit` | `trackSignIn(true)` | First-time user |

### Dashboard
| Event | Method | Description |
|-------|--------|-------------|
| `dashboard_viewed` | `trackDashboardViewed()` | Dashboard page loaded |
| `dashboard_data_refreshed` | `trackDataRefresh()` | User refreshed their data |
| `dashboard_loading_started` | `trackDashboardLoading("started")` | Loading began |
| `dashboard_loading_completed` | `trackDashboardLoading("completed")` | Loading finished |

### Content Interactions
| Event | Method | Description |
|-------|--------|-------------|
| `artist_clicked` | `trackArtistClicked()` | User clicked on an artist |
| `artist_spotify_opened` | Auto-tracked | Artist opened in Spotify |
| `track_clicked` | `trackTrackClicked()` | User clicked on a track |
| `track_spotify_opened` | Auto-tracked | Track opened in Spotify |
| `genre_clicked` | `trackGenreClicked()` | User clicked on a genre |
| `badge_viewed` | `trackBadgeViewed()` | Badge became visible |
| `badge_details_opened` | `trackBadgeDetailsOpened()` | Badge details expanded |

### Navigation
| Event | Method | Description |
|-------|--------|-------------|
| `time_range_changed` | `trackTimeRangeChanged()` | User changed time filter |
| `section_viewed` | `trackSectionViewed()` | Dashboard section viewed |
| `sidebar_nav_clicked` | `trackSidebarNavClicked()` | Sidebar navigation used |

### Features
| Event | Method | Description |
|-------|--------|-------------|
| `share_clicked` | `trackShareClicked()` | Share button clicked |
| `share_completed` | `trackShareCompleted()` | Share action completed |
| `chart_interacted` | `trackChartInteraction()` | Chart hover/click/zoom |
| `listening_patterns_viewed` | `trackListeningPatternsViewed()` | Patterns section viewed |

### Errors
| Event | Method | Description |
|-------|--------|-------------|
| `error_occurred` | `trackError()` | Generic error |
| `sync_failed` | `trackSyncFailed()` | Spotify sync failed |
| `api_error` | `trackApiError()` | API request failed |

## React Hooks

### `useAnalytics()`
Returns the analytics tracker instance for use in components.

```typescript
function MyComponent() {
  const analytics = useAnalytics();

  const handleClick = () => {
    analytics.trackArtistClicked({ ... });
  };
}
```

### `useTrackSectionView(section, timeRange)`
Automatically tracks when a section is viewed on mount.

```typescript
function ArtistsSection({ timeRange }) {
  useTrackSectionView("artists", timeRange);
  // Tracks once when component mounts
}
```

### `useTrackDashboardView(props)`
Tracks dashboard view with data statistics.

```typescript
function Dashboard({ data }) {
  useTrackDashboardView({
    time_range: "short_term",
    has_data: data.artists.length > 0,
    artist_count: data.artists.length,
    track_count: data.tracks.length,
  });
}
```

### `useTrackLoadingTime()`
Measures and tracks loading duration.

```typescript
function Dashboard() {
  const { startLoading, endLoading } = useTrackLoadingTime();

  useEffect(() => {
    startLoading();
    fetchData().then(() => endLoading());
  }, []);
}
```

### `useTrackTimeRangeChange(section)`
Tracks time range filter changes.

```typescript
function TimeRangeSelector({ section }) {
  const { trackChange, setInitialRange } = useTrackTimeRangeChange(section);

  useEffect(() => {
    setInitialRange("medium_term");
  }, []);

  const handleChange = (newRange) => {
    trackChange(newRange);
    // ... update state
  };
}
```

### `useTrackDataRefresh()`
Tracks data refresh with timing.

```typescript
function RefreshButton() {
  const { startRefresh, endRefresh } = useTrackDataRefresh();

  const handleRefresh = async () => {
    startRefresh("manual");
    try {
      await refreshData();
      endRefresh("manual", true);
    } catch {
      endRefresh("manual", false);
    }
  };
}
```

## Types

All event properties are fully typed. Import types as needed:

```typescript
import type {
  TimeRange,           // "short_term" | "medium_term" | "long_term"
  DashboardSection,    // "overview" | "artists" | "tracks" | ...
  ShareableContent,    // "profile" | "artist" | "track" | "stats"
  ErrorCategory,       // "sync" | "auth" | "api" | "render"
} from "@/services/analytics";
```

## User Identification

User identification is handled automatically by the `PostHogIdentify` component in `src/components/providers/PostHogIdentify.tsx`. When a user signs in via Spotify, their email, name, and avatar are sent to PostHog.

## Custom Events

For events not covered by the predefined methods:

```typescript
analytics.trackCustom("my_custom_event", {
  property1: "value1",
  property2: 123,
});
```

## User Properties

Set persistent user properties:

```typescript
analytics.setUserProperties({
  subscription_tier: "premium",
  favorite_genre: "rock",
});
```

## Best Practices

1. **Use predefined methods** - They ensure consistent event names and properties
2. **Track meaningful interactions** - Focus on actions that indicate engagement
3. **Include context** - Add relevant properties like `time_range`, `rank`, etc.
4. **Don't over-track** - Avoid tracking every mouse movement or scroll
5. **Use hooks in components** - They handle cleanup and prevent duplicate events
