"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface ProfileVisibilityNoticeProps {
  onDismiss: () => void;
  onGoPrivate: () => void;
}

export function ProfileVisibilityNotice({
  onDismiss,
  onGoPrivate,
}: ProfileVisibilityNoticeProps) {
  const [loading, setLoading] = useState(false);

  const handleGoPrivate = async () => {
    setLoading(true);
    await onGoPrivate();
    setLoading(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-bg-elevated rounded-2xl border border-border-subtle p-6 max-w-md w-full shadow-2xl"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-accent"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-text-primary">
              Your Profile is Public
            </h2>
          </div>

          <div className="space-y-4 mb-6">
            <p className="text-text-secondary text-sm">
              By default, other users can discover your profile and see:
            </p>
            <ul className="text-sm text-text-secondary space-y-2">
              <li className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-accent shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Your name and profile picture
              </li>
              <li className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-accent shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Top 5 artists and tracks
              </li>
              <li className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-accent shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Top genres and earned badges
              </li>
            </ul>
            <p className="text-sm text-text-secondary">
              Your email and detailed listening history are{" "}
              <span className="text-text-primary font-medium">never</span> shared.
            </p>
          </div>

          <div className="space-y-3">
            <motion.button
              onClick={onDismiss}
              className="w-full py-3 bg-accent text-black font-semibold rounded-full hover:bg-accent-soft transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Got it, stay public
            </motion.button>

            <motion.button
              onClick={handleGoPrivate}
              disabled={loading}
              className="w-full py-3 bg-bg-highlight text-text-primary font-semibold rounded-full hover:bg-bg-highlight/80 transition-colors disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? "Updating..." : "Make my profile private"}
            </motion.button>

            <Link
              href="/settings"
              className="block text-center text-sm text-text-secondary hover:text-accent transition-colors"
            >
              Manage settings later →
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
