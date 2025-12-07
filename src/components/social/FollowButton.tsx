"use client";

import { useState } from "react";
import { motion } from "framer-motion";

type FollowState = "none" | "following" | "pending" | "follow_back";

interface FollowButtonProps {
  userId: string;
  initialState: FollowState;
  isFollowedBy?: boolean;
  size?: "sm" | "md";
  onStateChange?: (newState: FollowState) => void;
}

export function FollowButton({
  userId,
  initialState,
  isFollowedBy = false,
  size = "md",
  onStateChange,
}: FollowButtonProps) {
  const [state, setState] = useState<FollowState>(initialState);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);

    try {
      if (state === "following" || state === "pending") {
        // Unfollow or cancel request
        await fetch("/api/follow", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
        const newState = isFollowedBy ? "follow_back" : "none";
        setState(newState);
        onStateChange?.(newState);
      } else {
        // Follow
        const response = await fetch("/api/follow", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
        const data = await response.json();

        if (response.ok) {
          const newState = data.status === "pending" ? "pending" : "following";
          setState(newState);
          onStateChange?.(newState);
        }
      }
    } catch (error) {
      console.error("Follow action failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const getButtonText = () => {
    if (loading) return "...";
    switch (state) {
      case "following":
        return "Following";
      case "pending":
        return "Requested";
      case "follow_back":
        return "Follow Back";
      default:
        return "Follow";
    }
  };

  const getButtonStyle = () => {
    const baseStyle = size === "sm"
      ? "px-4 py-1.5 text-sm"
      : "px-5 py-2";

    if (state === "following") {
      return `${baseStyle} bg-bg-highlight text-text-primary border border-border-subtle hover:border-red-500 hover:text-red-500`;
    }
    if (state === "pending") {
      return `${baseStyle} bg-bg-highlight text-text-secondary border border-border-subtle`;
    }
    return `${baseStyle} bg-accent text-black hover:bg-accent-soft`;
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={loading}
      className={`rounded-full font-semibold transition-colors ${getButtonStyle()}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {getButtonText()}
    </motion.button>
  );
}
