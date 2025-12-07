"use client";

import posthog from "posthog-js";
import NextError from "next/error";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.log("[PostHog] Capturing global error:", error.message);
    posthog.captureException(error);
  }, [error]);

  return (
    <html>
      <body className="bg-[#121212] text-white">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center p-8 bg-[#181818] rounded-xl border border-[#282828] max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              Something went wrong
            </h2>
            <p className="text-gray-400 mb-6">
              {error.message || "An unexpected error occurred."}
            </p>
            <button
              onClick={reset}
              className="px-6 py-2 bg-[#1DB954] hover:bg-[#1ed760] text-black font-semibold rounded-full transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
