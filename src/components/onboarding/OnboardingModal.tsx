"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ProfileVisibility } from "@/lib/types";

interface OnboardingModalProps {
  onComplete: () => void;
}

const VISIBILITY_OPTIONS: {
  value: ProfileVisibility;
  icon: string;
  label: string;
  description: string;
}[] = [
  {
    value: "PUBLIC",
    icon: "🌐",
    label: "Public",
    description: "Anyone can discover and view your music profile. Great for connecting with others!",
  },
  {
    value: "FOLLOWERS",
    icon: "👥",
    label: "Followers Only",
    description: "Only people you approve can see your stats. You control who follows you.",
  },
  {
    value: "PRIVATE",
    icon: "🔒",
    label: "Private",
    description: "Your profile is hidden. Only you can see your music stats.",
  },
];

export function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [selectedVisibility, setSelectedVisibility] = useState<ProfileVisibility>("PUBLIC");
  const [saving, setSaving] = useState(false);

  const handleComplete = async () => {
    setSaving(true);
    try {
      await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileVisibility: selectedVisibility,
          hasCompletedOnboarding: true,
        }),
      });
      onComplete();
    } catch (error) {
      console.error("Failed to save onboarding settings:", error);
      // Still complete to not block the user
      onComplete();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-bg-elevated border border-border-subtle rounded-2xl max-w-lg w-full overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          {step === 1 && (
            <div className="p-8">
              <div className="text-center mb-8">
                <motion.div
                  className="text-5xl mb-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                >
                  🎵
                </motion.div>
                <h2 className="text-2xl font-bold text-text-primary mb-2">
                  Welcome to Spotify Mirror!
                </h2>
                <p className="text-text-secondary">
                  Your personal music stats dashboard is ready. Let&apos;s set up your profile.
                </p>
              </div>

              <motion.button
                onClick={() => setStep(2)}
                className="w-full py-4 bg-accent text-black font-semibold rounded-full hover:bg-accent-soft transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Get Started
              </motion.button>
            </div>
          )}

          {step === 2 && (
            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-text-primary mb-2">
                  Who can see your profile?
                </h2>
                <p className="text-text-secondary text-sm">
                  Choose your default privacy setting. You can change this anytime in settings.
                </p>
              </div>

              <div className="space-y-3 mb-8">
                {VISIBILITY_OPTIONS.map((option) => (
                  <motion.button
                    key={option.value}
                    onClick={() => setSelectedVisibility(option.value)}
                    className={`w-full flex items-start gap-4 p-4 rounded-xl border transition-all text-left ${
                      selectedVisibility === option.value
                        ? "border-accent bg-accent/10"
                        : "border-border-subtle bg-bg-main hover:border-text-secondary"
                    }`}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <span className="text-2xl">{option.icon}</span>
                    <div className="flex-1">
                      <p
                        className={`font-semibold ${
                          selectedVisibility === option.value
                            ? "text-accent"
                            : "text-text-primary"
                        }`}
                      >
                        {option.label}
                      </p>
                      <p className="text-sm text-text-secondary mt-1">
                        {option.description}
                      </p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 ${
                        selectedVisibility === option.value
                          ? "border-accent"
                          : "border-text-secondary"
                      }`}
                    >
                      {selectedVisibility === option.value && (
                        <motion.div
                          className="w-2.5 h-2.5 rounded-full bg-accent"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 text-text-secondary hover:text-text-primary transition-colors"
                >
                  Back
                </button>
                <motion.button
                  onClick={handleComplete}
                  disabled={saving}
                  className="flex-1 py-3 bg-accent text-black font-semibold rounded-full hover:bg-accent-soft transition-colors disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {saving ? "Saving..." : "Complete Setup"}
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
