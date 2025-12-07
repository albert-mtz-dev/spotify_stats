"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { fadeInUp, defaultTransition } from "./presets";

type MotionSectionProps = HTMLMotionProps<"section">;

export function MotionSection({ children, ...props }: MotionSectionProps) {
  return (
    <motion.section
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      transition={defaultTransition}
      {...props}
    >
      {children}
    </motion.section>
  );
}
