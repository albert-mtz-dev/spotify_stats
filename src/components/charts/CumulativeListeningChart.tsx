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

interface CumulativeListeningChartProps {
  patterns: ListeningPattern[];
  mode?: "hourly" | "daily";
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const SHORT_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatHour(hour: number): string {
  if (hour === 0) return "12AM";
  if (hour === 12) return "12PM";
  if (hour < 12) return `${hour}AM`;
  return `${hour - 12}PM`;
}

export function CumulativeListeningChart({
  patterns,
  mode = "hourly",
}: CumulativeListeningChartProps) {
  let labels: string[];
  let cumulativeData: number[];

  if (mode === "hourly") {
    // Aggregate by hour first
    const hourCounts = new Array(24).fill(0);
    patterns.forEach((p) => {
      hourCounts[p.hour] += p.count;
    });

    // Calculate cumulative
    cumulativeData = [];
    let cumulative = 0;
    for (let i = 0; i < 24; i++) {
      cumulative += hourCounts[i];
      cumulativeData.push(cumulative);
    }

    labels = Array.from({ length: 24 }, (_, i) => formatHour(i));
  } else {
    // Aggregate by day
    const dayCounts = new Array(7).fill(0);
    patterns.forEach((p) => {
      dayCounts[p.dayOfWeek] += p.count;
    });

    // Calculate cumulative
    cumulativeData = [];
    let cumulative = 0;
    for (let i = 0; i < 7; i++) {
      cumulative += dayCounts[i];
      cumulativeData.push(cumulative);
    }

    labels = SHORT_DAYS;
  }

  const totalPlays = cumulativeData[cumulativeData.length - 1] || 0;

  const data = {
    labels,
    datasets: [
      {
        label: "Cumulative Plays",
        data: cumulativeData,
        fill: true,
        backgroundColor: "rgba(29, 185, 84, 0.15)",
        borderColor: "#1DB954",
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 3,
        pointBackgroundColor: "#1DB954",
        pointBorderColor: "#181818",
        pointBorderWidth: 2,
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
          title: (items) => {
            if (mode === "daily") {
              return DAYS[items[0].dataIndex];
            }
            return items[0].label;
          },
          label: (context) => {
            const value = context.raw as number;
            const percentage = totalPlays > 0 ? Math.round((value / totalPlays) * 100) : 0;
            return ` ${value} total plays (${percentage}%)`;
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
          maxTicksLimit: mode === "hourly" ? 12 : 7,
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
