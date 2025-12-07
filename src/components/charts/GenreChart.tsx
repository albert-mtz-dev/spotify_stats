"use client";

import { motion } from "framer-motion";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { fadeIn } from "@/components/motion/presets";
import type { GenreStat } from "@/lib/types";

ChartJS.register(ArcElement, Tooltip, Legend);

interface GenreChartProps {
  genres: GenreStat[];
}

const COLORS = [
  "#1DB954", // Spotify green
  "#1ed760",
  "#2ECC71",
  "#27AE60",
  "#16A085",
  "#1ABC9C",
  "#3498DB",
  "#2980B9",
  "#9B59B6",
  "#8E44AD",
];

export function GenreChart({ genres }: GenreChartProps) {
  if (genres.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-text-secondary">
        No genre data available
      </div>
    );
  }

  const data = {
    labels: genres.map((g) => g.genre),
    datasets: [
      {
        data: genres.map((g) => g.count),
        backgroundColor: COLORS.slice(0, genres.length),
        borderColor: "#121212",
        borderWidth: 2,
      },
    ],
  };

  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "60%",
    plugins: {
      legend: {
        position: "right",
        labels: {
          color: "#b3b3b3",
          font: {
            size: 12,
          },
          padding: 12,
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        backgroundColor: "#181818",
        titleColor: "#ffffff",
        bodyColor: "#b3b3b3",
        borderColor: "#282828",
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: (context) => {
            const genre = genres[context.dataIndex];
            return ` ${genre.count} artists (${genre.percentage}%)`;
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
      <Doughnut data={data} options={options} />
    </motion.div>
  );
}
