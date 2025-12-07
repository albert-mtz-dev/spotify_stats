"use client";

import { motion } from "framer-motion";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { fadeIn } from "@/components/motion/presets";
import type { ListeningPattern } from "@/lib/types";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

interface ListeningByHourChartProps {
  patterns: ListeningPattern[];
}

function formatHour(hour: number): string {
  if (hour === 0) return "12AM";
  if (hour === 12) return "12PM";
  if (hour < 12) return `${hour}AM`;
  return `${hour - 12}PM`;
}

export function ListeningByHourChart({ patterns }: ListeningByHourChartProps) {
  // Aggregate by hour
  const hourCounts = new Array(24).fill(0);
  patterns.forEach((p) => {
    hourCounts[p.hour] += p.count;
  });

  const labels = Array.from({ length: 24 }, (_, i) => formatHour(i));

  const data = {
    labels,
    datasets: [
      {
        label: "Plays",
        data: hourCounts,
        fill: true,
        backgroundColor: "rgba(29, 185, 84, 0.2)",
        borderColor: "#1DB954",
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: "#1DB954",
        pointHoverBorderColor: "#fff",
      },
    ],
  };

  const options: ChartOptions<"line"> = {
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
        intersect: false,
        mode: "index",
        callbacks: {
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
          maxTicksLimit: 12,
          font: {
            size: 10,
          },
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
    interaction: {
      intersect: false,
      mode: "index",
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
      <Line data={data} options={options} />
    </motion.div>
  );
}
