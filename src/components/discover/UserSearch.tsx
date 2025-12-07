"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { UserCard } from "@/components/ui/UserCard";
import { fadeInUp, staggerContainer } from "@/components/motion/presets";
import type { UserSearchResult } from "@/lib/types";

export function UserSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const search = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const response = await fetch(
        `/api/users/search?q=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();
      setResults(data.users || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      search(query);
    }, 300);

    return () => clearTimeout(debounce);
  }, [query, search]);

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users by name..."
          className="w-full pl-12 pr-4 py-3 bg-bg-elevated border border-border-subtle rounded-xl text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent transition-colors"
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Results */}
      {searched && !loading && (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {results.length === 0 ? (
            <motion.div
              variants={fadeInUp}
              className="text-center py-8 text-text-secondary"
            >
              <p>No users found matching &ldquo;{query}&rdquo;</p>
              <p className="text-sm mt-1">
                Try a different search term or check the spelling
              </p>
            </motion.div>
          ) : (
            results.map((user) => (
              <motion.div key={user.id} variants={fadeInUp}>
                <UserCard user={user} />
              </motion.div>
            ))
          )}
        </motion.div>
      )}

      {/* Initial State */}
      {!searched && (
        <div className="text-center py-12 text-text-secondary">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-text-secondary/50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <p className="text-lg font-medium">Discover Music Lovers</p>
          <p className="text-sm mt-1">
            Search for other users to see their music taste
          </p>
        </div>
      )}
    </div>
  );
}
