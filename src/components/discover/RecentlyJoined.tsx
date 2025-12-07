"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UserCard } from "@/components/ui/UserCard";
import { fadeInUp, staggerContainer } from "@/components/motion/presets";
import type { UserSearchResult } from "@/lib/types";

export function RecentlyJoined() {
  const [users, setUsers] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecentUsers() {
      try {
        const response = await fetch("/api/users/recent?limit=6");
        const data = await response.json();
        setUsers(data.users || []);
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }

    fetchRecentUsers();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-text-primary">
          Recently Joined
        </h2>
        <div className="grid gap-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-bg-elevated rounded-xl border border-border-subtle p-4 animate-pulse"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-bg-highlight" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-bg-highlight rounded w-1/3" />
                  <div className="h-3 bg-bg-highlight rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return null; // Don't show section if no recent users
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-text-primary">
        Recently Joined
      </h2>
      <motion.div
        className="grid gap-3"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {users.map((user) => (
          <motion.div key={user.id} variants={fadeInUp}>
            <UserCard user={user} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
