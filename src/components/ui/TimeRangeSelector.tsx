"use client";

import { motion } from "framer-motion";
import type { TimeRange } from "@/lib/types";
import { TIME_RANGE_LABELS } from "@/lib/types";

interface TimeRangeSelectorProps {
  value: TimeRange;
  onChange: (value: TimeRange) => void;
}

const timeRanges: TimeRange[] = ["short_term", "medium_term", "long_term"];

export function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  return (
    <div className="inline-flex bg-bg-elevated rounded-lg border border-border-subtle p-1">
      {timeRanges.map((range) => (
        <button
          key={range}
          onClick={() => onChange(range)}
          className={`relative px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            value === range
              ? "text-text-primary"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          {value === range && (
            <motion.div
              layoutId="timeRangeIndicator"
              className="absolute inset-0 bg-bg-highlight rounded-md"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          <span className="relative z-10">{TIME_RANGE_LABELS[range]}</span>
        </button>
      ))}
    </div>
  );
}
