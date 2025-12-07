"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { UserSettings, ProfileVisibility } from "@/lib/types";

interface PrivacySettingsProps {
  initialSettings: UserSettings;
}

export function PrivacySettings({ initialSettings }: PrivacySettingsProps) {
  const [settings, setSettings] = useState<UserSettings>(initialSettings);
  const [username, setUsername] = useState(initialSettings.username || "");
  const [bio, setBio] = useState(initialSettings.bio || "");
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

  const toggleVisibility = () => {
    const newVisibility: ProfileVisibility =
      settings.profileVisibility === "PUBLIC" ? "PRIVATE" : "PUBLIC";
    setSettings({ ...settings, profileVisibility: newVisibility });
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

        <div className="flex items-center justify-between">
          <div>
            <p className="text-text-primary font-medium">
              {settings.profileVisibility === "PUBLIC"
                ? "Public Profile"
                : "Private Profile"}
            </p>
            <p className="text-sm text-text-secondary mt-1">
              {settings.profileVisibility === "PUBLIC"
                ? "Anyone can view your profile and music stats"
                : "Only you can see your profile and music stats"}
            </p>
          </div>

          <button
            onClick={toggleVisibility}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              settings.profileVisibility === "PUBLIC"
                ? "bg-accent"
                : "bg-bg-highlight"
            }`}
          >
            <motion.div
              className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
              animate={{
                left: settings.profileVisibility === "PUBLIC" ? "1.75rem" : "0.25rem",
              }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
        </div>

        {settings.profileVisibility === "PUBLIC" && (
          <div className="mt-4 p-4 bg-bg-highlight/50 rounded-lg">
            <p className="text-sm text-text-secondary">
              <span className="font-medium text-text-primary">What others can see:</span>
              <br />
              Your name, profile picture, bio, top 5 artists, top 5 tracks, top genres, and badges.
            </p>
          </div>
        )}
      </motion.div>

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
          Claim a unique username for a shorter profile URL. Leave empty to use
          your default profile ID.
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
        transition={{ duration: 0.2, delay: 0.2 }}
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
