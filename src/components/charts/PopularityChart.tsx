"use client";

import { motion } from "framer-motion";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  ChartOptions,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { fadeIn } from "@/components/motion/presets";
import type { TrackSummary } from "@/lib/types";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

interface PopularityChartProps {
  tracks: TrackSummary[];
}

const POPULARITY_RANGES = [
  { label: "0-20", min: 0, max: 20, description: "Hidden Gems" },
  { label: "21-40", min: 21, max: 40, description: "Underground" },
  { label: "41-60", min: 41, max: 60, description: "Moderate" },
  { label: "61-80", min: 61, max: 80, description: "Popular" },
  { label: "81-100", min: 81, max: 100, description: "Mainstream" },
];

const GRADIENT_COLORS = [
  "rgba(29, 185, 84, 0.4)",
  "rgba(29, 185, 84, 0.55)",
  "rgba(29, 185, 84, 0.7)",
  "rgba(29, 185, 84, 0.85)",
  "rgba(29, 185, 84, 1)",
];

export function PopularityChart({ tracks }: PopularityChartProps) {
  // Count tracks in each popularity range
  const rangeCounts = POPULARITY_RANGES.map((range) => {
    return tracks.filter((t) => t.popularity >= range.min && t.popularity <= range.max).length;
  });

  const data = {
    labels: POPULARITY_RANGES.map((r) => r.label),
    datasets: [
      {
        label: "Tracks",
        data: rangeCounts,
        backgroundColor: GRADIENT_COLORS,
        borderColor: "#1DB954",
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#181818",
        titleColor: "#ffffff",
        bodyColor: "#b3b3b3",
        borderColor: "#282828",
        borderWidth: 1,
        padding: 12,
        callbacks: {
          title: (items) => {
            const idx = items[0].dataIndex;
            return POPULARITY_RANGES[idx].description;
          },
          label: (context) => {
            const count = context.raw as number;
            const percentage = tracks.length > 0 ? Math.round((count / tracks.length) * 100) : 0;
            return ` ${count} tracks (${percentage}%)`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#b3b3b3",
        },
        title: {
          display: true,
          text: "Popularity Score",
          color: "#b3b3b3",
          font: {
            size: 11,
          },
        },
      },
      y: {
        grid: {
          color: "#282828",
        },
        ticks: {
          color: "#b3b3b3",
          stepSize: 1,
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <motion.div
      className="h-48"
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.3 }}
    >
      <Bar data={data} options={options} />
    </motion.div>
  );
}
