"use client";

import { motion } from "framer-motion";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { Radar } from "react-chartjs-2";
import { fadeIn } from "@/components/motion/presets";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface AudioFeaturesRadarProps {
  energy: number;
  danceability: number;
  mood: number;
  acoustic: number;
  tempo: number; // Will be normalized to 0-100
}

export function AudioFeaturesRadar({
  energy,
  danceability,
  mood,
  acoustic,
  tempo,
}: AudioFeaturesRadarProps) {
  // Normalize tempo (assume typical range 60-180 BPM)
  const normalizedTempo = Math.min(100, Math.max(0, ((tempo - 60) / 120) * 100));

  const data = {
    labels: ["Energy", "Danceability", "Mood", "Acoustic", "Tempo"],
    datasets: [
      {
        label: "Your Sound Profile",
        data: [energy, danceability, mood, acoustic, normalizedTempo],
        backgroundColor: "rgba(29, 185, 84, 0.3)",
        borderColor: "#1DB954",
        borderWidth: 2,
        pointBackgroundColor: "#1DB954",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "#1DB954",
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options: ChartOptions<"radar"> = {
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
          label: (context) => {
            const label = context.label || "";
            const value = context.raw as number;
            if (label === "Tempo") {
              return ` ${Math.round(tempo)} BPM`;
            }
            return ` ${Math.round(value)}%`;
          },
        },
      },
    },
    scales: {
      r: {
        angleLines: {
          color: "#282828",
        },
        grid: {
          color: "#282828",
        },
        pointLabels: {
          color: "#b3b3b3",
          font: {
            size: 12,
          },
        },
        ticks: {
          display: false,
          stepSize: 20,
        },
        suggestedMin: 0,
        suggestedMax: 100,
      },
    },
  };

  return (
    <motion.div
      className="h-72"
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.3 }}
    >
      <Radar data={data} options={options} />
    </motion.div>
  );
}
