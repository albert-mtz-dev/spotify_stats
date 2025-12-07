"use client";

import posthog from "posthog-js";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.log("[PostHog] Capturing error boundary exception:", error.message);
    posthog.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-main">
      <div className="text-center p-8 bg-bg-elevated rounded-xl border border-border-subtle max-w-md">
        <h2 className="text-xl font-semibold text-text-primary mb-4">
          Something went wrong
        </h2>
        <p className="text-text-secondary mb-6">
          {error.message || "An unexpected error occurred."}
        </p>
        <button
          onClick={reset}
          className="px-6 py-2 bg-accent hover:bg-accent-soft text-black font-semibold rounded-full transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
