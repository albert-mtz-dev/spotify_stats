"use client";

import { motion } from "framer-motion";

interface StatCardProps {
  label: string;
  value: string;
  subtitle?: string;
}

export function StatCard({ label, value, subtitle }: StatCardProps) {
  return (
    <motion.div
      className="bg-bg-elevated rounded-xl border border-border-subtle p-4"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.15 }}
    >
      <p className="text-sm text-text-secondary mb-1">{label}</p>
      <p className="text-2xl font-bold text-text-primary truncate">{value}</p>
      {subtitle && (
        <p className="text-xs text-text-secondary mt-1">{subtitle}</p>
      )}
    </motion.div>
  );
}
