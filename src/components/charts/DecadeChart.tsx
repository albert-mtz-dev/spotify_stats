"use client";

import { motion } from "framer-motion";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { fadeIn } from "@/components/motion/presets";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface DecadeChartProps {
  decadeBreakdown: { decade: string; percentage: number }[];
}

const GRADIENT_COLORS = [
  "#1DB954",
  "#1ed760",
  "#2ECC71",
  "#27AE60",
  "#16A085",
  "#1ABC9C",
  "#3498DB",
  "#9B59B6",
];

export function DecadeChart({ decadeBreakdown }: DecadeChartProps) {
  if (decadeBreakdown.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-text-secondary">
        No decade data available
      </div>
    );
  }

  // Sort by decade ascending
  const sorted = [...decadeBreakdown].sort((a, b) => a.decade.localeCompare(b.decade));

  const data = {
    labels: sorted.map((d) => d.decade),
    datasets: [
      {
        label: "% of tracks",
        data: sorted.map((d) => d.percentage),
        backgroundColor: sorted.map((_, i) => GRADIENT_COLORS[i % GRADIENT_COLORS.length]),
        borderColor: "#121212",
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y",
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
          label: (context) => ` ${context.raw}% of your tracks`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: "#282828",
        },
        ticks: {
          color: "#b3b3b3",
          callback: (value) => `${value}%`,
        },
        max: 100,
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#b3b3b3",
          font: {
            size: 12,
          },
        },
      },
    },
  };

  return (
    <motion.div
      className="h-64"
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.3 }}
    >
      <Bar data={data} options={options} />
    </motion.div>
  );
}
