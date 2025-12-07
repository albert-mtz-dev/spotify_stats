"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { UserSettings, ProfileVisibility, PrivacySettings as PrivacySettingsType } from "@/lib/types";

interface PrivacySettingsProps {
  initialSettings: UserSettings;
  userId: string;
}

const VISIBILITY_OPTIONS: { value: ProfileVisibility; label: string; description: string }[] = [
  {
    value: "PUBLIC",
    label: "Public",
    description: "Anyone can view your profile",
  },
  {
    value: "FOLLOWERS",
    label: "Followers Only",
    description: "Only approved followers can view",
  },
  {
    value: "PRIVATE",
    label: "Private",
    description: "Only you can see your profile",
  },
];

const PRIVACY_OPTIONS: { key: keyof PrivacySettingsType; label: string; description: string }[] = [
  {
    key: "shareTopArtists",
    label: "Top Artists",
    description: "Show your favorite artists",
  },
  {
    key: "shareTopTracks",
    label: "Top Tracks",
    description: "Show your most played songs",
  },
  {
    key: "shareGenres",
    label: "Genre Breakdown",
    description: "Show your music genres",
  },
  {
    key: "shareAudioProfile",
    label: "Audio Profile",
    description: "Show energy, mood, danceability stats",
  },
  {
    key: "shareBadges",
    label: "Badges",
    description: "Show earned achievement badges",
  },
  {
    key: "shareListeningStats",
    label: "Listening Stats",
    description: "Show listening time and counts",
  },
  {
    key: "sharePatterns",
    label: "Listening Patterns",
    description: "Show when you listen (hour/day)",
  },
  {
    key: "shareRecentlyPlayed",
    label: "Recently Played",
    description: "Show your recent listening history",
  },
  {
    key: "allowComparison",
    label: "Allow Comparisons",
    description: "Let others see taste compatibility",
  },
];

export function PrivacySettings({ initialSettings, userId }: PrivacySettingsProps) {
  const [settings, setSettings] = useState<UserSettings>(initialSettings);
  const [username, setUsername] = useState(initialSettings.username || "");
  const [bio, setBio] = useState(initialSettings.bio || "");
  const profileUrl = `/u/${username || userId}`;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim() || null,
          bio: bio.trim() || null,
          profileVisibility: settings.profileVisibility,
          privacy: settings.privacy,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to save settings");
        return;
      }

      setSettings(data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const setVisibility = (visibility: ProfileVisibility) => {
    setSettings({ ...settings, profileVisibility: visibility });
  };

  const togglePrivacy = (key: keyof PrivacySettingsType) => {
    setSettings({
      ...settings,
      privacy: {
        ...settings.privacy,
        [key]: !settings.privacy[key],
      },
    });
  };

  return (
    <div className="space-y-8">
      {/* Profile Visibility */}
      <motion.div
        className="bg-bg-elevated rounded-xl border border-border-subtle p-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <h2 className="text-lg font-semibold text-text-primary mb-4">
          Profile Visibility
        </h2>
        <p className="text-sm text-text-secondary mb-4">
          Control who can see your profile and music stats.
        </p>

        <div className="space-y-3">
          {VISIBILITY_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setVisibility(option.value)}
              className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all ${
                settings.profileVisibility === option.value
                  ? "border-accent bg-accent/10"
                  : "border-border-subtle bg-bg-main hover:border-text-secondary"
              }`}
            >
              <div className="text-left">
                <p className={`font-medium ${
                  settings.profileVisibility === option.value
                    ? "text-accent"
                    : "text-text-primary"
                }`}>
                  {option.label}
                </p>
                <p className="text-sm text-text-secondary">{option.description}</p>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  settings.profileVisibility === option.value
                    ? "border-accent"
                    : "border-text-secondary"
                }`}
              >
                {settings.profileVisibility === option.value && (
                  <div className="w-2.5 h-2.5 rounded-full bg-accent" />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Preview Profile Button */}
        <div className="mt-6 pt-4 border-t border-border-subtle">
          <Link
            href={profileUrl}
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2 bg-bg-main border border-border-subtle rounded-lg text-text-primary hover:border-accent hover:text-accent transition-colors"
          >
            <svg
              className="w-4 h-4"
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
            Preview your public profile
          </Link>
          <p className="text-xs text-text-secondary mt-2">
            See how others view your profile
          </p>
        </div>
      </motion.div>

      {/* Privacy Controls */}
      {settings.profileVisibility !== "PRIVATE" && (
        <motion.div
          className="bg-bg-elevated rounded-xl border border-border-subtle p-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.05 }}
        >
          <h2 className="text-lg font-semibold text-text-primary mb-2">
            What to Share
          </h2>
          <p className="text-sm text-text-secondary mb-4">
            Choose which stats to display on your profile.
          </p>

          <div className="space-y-3">
            {PRIVACY_OPTIONS.map((option) => (
              <div
                key={option.key}
                className="flex items-center justify-between py-3 border-b border-border-subtle last:border-0"
              >
                <div>
                  <p className="font-medium text-text-primary">{option.label}</p>
                  <p className="text-sm text-text-secondary">{option.description}</p>
                </div>
                <button
                  onClick={() => togglePrivacy(option.key)}
                  className={`relative w-12 h-7 rounded-full transition-colors ${
                    settings.privacy[option.key]
                      ? "bg-accent"
                      : "bg-bg-highlight"
                  }`}
                >
                  <motion.div
                    className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-md"
                    animate={{
                      left: settings.privacy[option.key] ? "1.5rem" : "0.25rem",
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Username */}
      <motion.div
        className="bg-bg-elevated rounded-xl border border-border-subtle p-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.1 }}
      >
        <h2 className="text-lg font-semibold text-text-primary mb-4">
          Custom Username
        </h2>

        <p className="text-sm text-text-secondary mb-4">
          Claim a unique username for a shorter profile URL.
        </p>

        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase())}
          placeholder="username"
          maxLength={20}
          className="w-full px-4 py-3 bg-bg-main border border-border-subtle rounded-lg text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent transition-colors"
        />

        <p className="text-xs text-text-secondary mt-2">
          3-20 characters. Letters, numbers, and underscores only.
        </p>

        {username && (
          <p className="text-sm text-text-secondary mt-2">
            Your profile URL:{" "}
            <span className="text-accent">
              {typeof window !== "undefined" ? window.location.origin : ""}/u/
              {username}
            </span>
          </p>
        )}
      </motion.div>

      {/* Bio */}
      <motion.div
        className="bg-bg-elevated rounded-xl border border-border-subtle p-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.15 }}
      >
        <h2 className="text-lg font-semibold text-text-primary mb-4">Bio</h2>

        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell others about your music taste..."
          maxLength={160}
          rows={3}
          className="w-full px-4 py-3 bg-bg-main border border-border-subtle rounded-lg text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent transition-colors resize-none"
        />

        <p className="text-xs text-text-secondary mt-2 text-right">
          {bio.length}/160
        </p>
      </motion.div>

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <motion.button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-accent text-black font-semibold rounded-full hover:bg-accent-soft transition-colors disabled:opacity-50"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {saving ? "Saving..." : "Save Changes"}
        </motion.button>

        {error && <p className="text-red-400 text-sm">{error}</p>}
        {success && <p className="text-accent text-sm">Settings saved!</p>}
      </div>
    </div>
  );
}
