"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import posthog from "posthog-js";
import { analytics } from "@/services/analytics";

/**
 * Component that identifies the user with PostHog when they sign in.
 * This should be rendered inside both SessionProvider and PostHogProvider.
 */
export function PostHogIdentify() {
  const { data: session, status } = useSession();
  const hasIdentified = useRef(false);
  const sessionStart = useRef<number | null>(null);

  useEffect(() => {
    if (status === "authenticated" && session?.user && !hasIdentified.current) {
      // Identify the user with PostHog
      posthog.identify(session.user.email ?? session.user.id, {
        email: session.user.email,
        name: session.user.name,
        avatar: session.user.image,
      });

      // Track sign-in event
      analytics.trackSignIn();
      hasIdentified.current = true;
      sessionStart.current = Date.now();
    } else if (status === "unauthenticated" && hasIdentified.current) {
      // Track sign-out with session duration
      if (sessionStart.current) {
        const durationSeconds = Math.floor((Date.now() - sessionStart.current) / 1000);
        analytics.trackSignOut(durationSeconds);
      }

      // Reset identification when user logs out
      posthog.reset();
      hasIdentified.current = false;
      sessionStart.current = null;
    }
  }, [session, status]);

  return null;
}
