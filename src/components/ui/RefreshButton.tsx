"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export function RefreshButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/user/sync", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to refresh");
        return;
      }

      // Refresh the page to show new data
      router.refresh();
    } catch {
      setError("Failed to refresh data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <motion.button
        onClick={handleRefresh}
        disabled={loading}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        title="Refresh your Spotify data"
      >
        <motion.svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          animate={loading ? { rotate: 360 } : {}}
          transition={loading ? { repeat: Infinity, duration: 1, ease: "linear" } : {}}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </motion.svg>
        {loading ? "Refreshing..." : "Refresh"}
      </motion.button>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}
