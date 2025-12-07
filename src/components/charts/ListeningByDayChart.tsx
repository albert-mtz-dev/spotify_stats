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
import type { ListeningPattern } from "@/lib/types";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

interface ListeningByDayChartProps {
  patterns: ListeningPattern[];
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const SHORT_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function ListeningByDayChart({ patterns }: ListeningByDayChartProps) {
  // Aggregate by day
  const dayCounts = new Array(7).fill(0);
  patterns.forEach((p) => {
    dayCounts[p.dayOfWeek] += p.count;
  });

  const maxCount = Math.max(...dayCounts);

  const data = {
    labels: SHORT_DAYS,
    datasets: [
      {
        label: "Plays",
        data: dayCounts,
        backgroundColor: dayCounts.map((count) =>
          count === maxCount ? "#1DB954" : "rgba(29, 185, 84, 0.5)"
        ),
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
          title: (items) => DAYS[items[0].dataIndex],
          label: (context) => ` ${context.raw} plays`,
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
      },
      y: {
        grid: {
          color: "#282828",
        },
        ticks: {
          color: "#b3b3b3",
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
