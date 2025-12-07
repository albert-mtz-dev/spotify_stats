"use client"

import { useEffect } from "react"
import posthog from "posthog-js"
import { PostHogProvider as PHProvider } from "posthog-js/react"

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com"

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined") return

    console.log("[PostHog] Initializing...")
    console.log("[PostHog] Key:", POSTHOG_KEY?.substring(0, 15) + "...")
    console.log("[PostHog] Host:", POSTHOG_HOST)

    if (!POSTHOG_KEY) {
      console.error("[PostHog] ERROR: NEXT_PUBLIC_POSTHOG_KEY not found!")
      return
    }

    if (posthog.__loaded) {
      console.log("[PostHog] Already loaded, skipping init")
      return
    }

    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      person_profiles: "identified_only",
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: true,
      debug: process.env.NODE_ENV === "development",
      loaded: (ph) => {
        console.log("[PostHog] Loaded successfully!")
        console.log("[PostHog] Distinct ID:", ph.get_distinct_id())

        // Wrap capture to log all events in development
        if (process.env.NODE_ENV === "development") {
          const originalCapture = ph.capture.bind(ph)
          ph.capture = (eventName: string, properties?: Record<string, unknown>) => {
            console.log(`[PostHog] Event: "${eventName}"`, properties || {})
            return originalCapture(eventName, properties)
          }
        }
      },
    })
  }, [])

  return <PHProvider client={posthog}>{children}</PHProvider>
}
