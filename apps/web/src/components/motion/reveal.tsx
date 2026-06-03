"use client";

import { type HTMLMotionProps, motion, useReducedMotion } from "motion/react";

const EASE: [number, number, number, number] = [0.21, 0.47, 0.32, 0.98];

type RevealProps = HTMLMotionProps<"div"> & {
  delay?: number;
  y?: number;
};

export function Reveal({ children, delay = 0, y = 16, ...props }: RevealProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y }}
      transition={{ duration: 0.5, delay, ease: EASE }}
      viewport={{ once: true, margin: "-80px" }}
      whileInView={{ opacity: 1, y: 0 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
