"use client";

import { motion } from "framer-motion";
import { fadeIn } from "@/components/motion/presets";
import type { ListeningPattern } from "@/lib/types";

interface ActivityHeatmapProps {
  patterns: ListeningPattern[];
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function getIntensityColor(count: number, maxCount: number): string {
  if (count === 0) return "bg-bg-main";
  const intensity = count / maxCount;
  if (intensity < 0.25) return "bg-accent/20";
  if (intensity < 0.5) return "bg-accent/40";
  if (intensity < 0.75) return "bg-accent/60";
  return "bg-accent";
}

function formatHour(hour: number): string {
  if (hour === 0) return "12a";
  if (hour === 12) return "12p";
  if (hour < 12) return `${hour}a`;
  return `${hour - 12}p`;
}

export function ActivityHeatmap({ patterns }: ActivityHeatmapProps) {
  // Create a lookup map for quick access
  const patternMap = new Map<string, number>();
  patterns.forEach((p) => {
    patternMap.set(`${p.dayOfWeek}-${p.hour}`, p.count);
  });

  const maxCount = Math.max(...patterns.map((p) => p.count), 1);

  // Show only every 4th hour for cleaner display
  const displayHours = HOURS.filter((h) => h % 4 === 0);

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.3 }}
    >
      <div className="overflow-x-auto">
        <div className="min-w-[400px]">
          {/* Hour labels */}
          <div className="flex mb-1 ml-10">
            {displayHours.map((hour) => (
              <div
                key={hour}
                className="text-xs text-text-secondary"
                style={{ width: `${100 / 6}%` }}
              >
                {formatHour(hour)}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="space-y-1">
            {DAYS.map((day, dayIndex) => (
              <div key={day} className="flex items-center gap-2">
                <span className="text-xs text-text-secondary w-8">{day}</span>
                <div className="flex-1 flex gap-0.5">
                  {HOURS.map((hour) => {
                    const count = patternMap.get(`${dayIndex}-${hour}`) || 0;
                    return (
                      <motion.div
                        key={hour}
                        className={`flex-1 h-4 rounded-sm ${getIntensityColor(count, maxCount)} cursor-pointer`}
                        title={`${day} ${formatHour(hour)}: ${count} plays`}
                        whileHover={{ scale: 1.2 }}
                        transition={{ duration: 0.1 }}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end gap-2 mt-4">
            <span className="text-xs text-text-secondary">Less</span>
            <div className="flex gap-0.5">
              <div className="w-3 h-3 rounded-sm bg-bg-main" />
              <div className="w-3 h-3 rounded-sm bg-accent/20" />
              <div className="w-3 h-3 rounded-sm bg-accent/40" />
              <div className="w-3 h-3 rounded-sm bg-accent/60" />
              <div className="w-3 h-3 rounded-sm bg-accent" />
            </div>
            <span className="text-xs text-text-secondary">More</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
