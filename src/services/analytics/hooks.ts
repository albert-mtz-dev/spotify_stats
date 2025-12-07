"use client";

import { useEffect, useRef, useCallback } from "react";
import { analytics } from "./tracker";
import type { TimeRange, DashboardSection } from "./types";

/**
 * Hook to track when a section becomes visible
 * Automatically tracks section views when mounted
 */
export function useTrackSectionView(section: DashboardSection, timeRange: TimeRange) {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!hasTracked.current) {
      analytics.trackSectionViewed(section, timeRange);
      hasTracked.current = true;
    }
  }, [section, timeRange]);
}

/**
 * Hook to track dashboard view with data stats
 */
export function useTrackDashboardView(props: {
  time_range: TimeRange;
  has_data: boolean;
  artist_count?: number;
  track_count?: number;
}) {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!hasTracked.current && props.has_data !== undefined) {
      analytics.trackDashboardViewed(props);
      hasTracked.current = true;
    }
  }, [props]);
}

/**
 * Hook to measure and track loading time
 * Returns a function to call when loading completes
 */
export function useTrackLoadingTime() {
  const startTime = useRef<number | null>(null);

  const startLoading = useCallback(() => {
    startTime.current = Date.now();
    analytics.trackDashboardLoading("started");
  }, []);

  const endLoading = useCallback(() => {
    if (startTime.current) {
      const duration = Date.now() - startTime.current;
      analytics.trackDashboardLoading("completed", duration);
      startTime.current = null;
    }
  }, []);

  return { startLoading, endLoading };
}

/**
 * Hook for tracking time range changes
 * Returns a handler function that tracks the change
 */
export function useTrackTimeRangeChange(section: DashboardSection) {
  const currentRange = useRef<TimeRange>("medium_term");

  const trackChange = useCallback(
    (newRange: TimeRange) => {
      if (currentRange.current !== newRange) {
        analytics.trackTimeRangeChanged(currentRange.current, newRange, section);
        currentRange.current = newRange;
      }
    },
    [section]
  );

  const setInitialRange = useCallback((range: TimeRange) => {
    currentRange.current = range;
  }, []);

  return { trackChange, setInitialRange };
}

/**
 * Hook for tracking data refresh with timing
 */
export function useTrackDataRefresh() {
  const startTime = useRef<number | null>(null);

  const startRefresh = useCallback((trigger: "manual" | "automatic") => {
    startTime.current = Date.now();
    return trigger;
  }, []);

  const endRefresh = useCallback((trigger: "manual" | "automatic", success: boolean) => {
    const duration = startTime.current ? Date.now() - startTime.current : undefined;
    analytics.trackDataRefresh({
      trigger,
      success,
      duration_ms: duration,
    });
    startTime.current = null;
  }, []);

  return { startRefresh, endRefresh };
}

/**
 * Hook that provides all analytics tracking methods
 * Convenient for components that need multiple tracking capabilities
 */
export function useAnalytics() {
  return analytics;
}
