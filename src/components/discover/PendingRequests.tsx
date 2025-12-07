"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { fadeInUp, staggerContainer } from "@/components/motion/presets";

interface FollowRequest {
  id: string;
  fromUser: {
    id: string;
    name: string | null;
    username: string | null;
    image: string | null;
  };
  createdAt: string;
}

export function PendingRequests() {
  const [requests, setRequests] = useState<FollowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRequests() {
      try {
        const response = await fetch("/api/follow/requests");
        if (response.ok) {
          const data = await response.json();
          setRequests(data.requests || []);
        }
      } catch {
        setRequests([]);
      } finally {
        setLoading(false);
      }
    }

    fetchRequests();
  }, []);

  const handleAction = async (requestId: string, action: "accept" | "reject") => {
    setProcessing(requestId);
    try {
      const response = await fetch("/api/follow/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action }),
      });

      if (response.ok) {
        setRequests((prev) => prev.filter((r) => r.id !== requestId));
      }
    } catch (error) {
      console.error("Failed to process request:", error);
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-text-primary">
          Follow Requests
        </h2>
        <div className="bg-bg-elevated rounded-xl border border-border-subtle p-4 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-bg-highlight" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-bg-highlight rounded w-1/3" />
              <div className="h-3 bg-bg-highlight rounded w-1/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (requests.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-text-primary">
          Follow Requests
        </h2>
        <span className="text-sm text-accent font-medium">
          {requests.length} pending
        </span>
      </div>

      <motion.div
        className="space-y-3"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {requests.map((request) => {
          const profileUrl = `/u/${request.fromUser.username || request.fromUser.id}`;
          const isProcessing = processing === request.id;

          return (
            <motion.div
              key={request.id}
              variants={fadeInUp}
              className="bg-bg-elevated rounded-xl border border-border-subtle p-4"
            >
              <div className="flex items-center gap-4">
                <Link href={profileUrl} className="shrink-0">
                  {request.fromUser.image ? (
                    <Image
                      src={request.fromUser.image}
                      alt={request.fromUser.name || "User"}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-bg-highlight flex items-center justify-center">
                      <span className="text-lg font-bold text-text-secondary">
                        {(request.fromUser.name || "U").charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </Link>

                <Link href={profileUrl} className="flex-1 min-w-0">
                  <p className="font-medium text-text-primary truncate hover:text-accent transition-colors">
                    {request.fromUser.name || "Unknown"}
                  </p>
                  {request.fromUser.username && (
                    <p className="text-sm text-text-secondary">
                      @{request.fromUser.username}
                    </p>
                  )}
                </Link>

                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={() => handleAction(request.id, "accept")}
                    disabled={isProcessing}
                    className="px-4 py-1.5 text-sm font-semibold rounded-full bg-accent text-black hover:bg-accent-soft transition-colors disabled:opacity-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isProcessing ? "..." : "Accept"}
                  </motion.button>
                  <motion.button
                    onClick={() => handleAction(request.id, "reject")}
                    disabled={isProcessing}
                    className="px-4 py-1.5 text-sm font-semibold rounded-full bg-bg-highlight text-text-primary border border-border-subtle hover:border-red-500 hover:text-red-500 transition-colors disabled:opacity-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isProcessing ? "..." : "Decline"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
