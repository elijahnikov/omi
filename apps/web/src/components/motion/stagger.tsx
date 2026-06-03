"use client";

import {
  type HTMLMotionProps,
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react";

const EASE: [number, number, number, number] = [0.21, 0.47, 0.32, 0.98];

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE },
  },
};

/**
 * Parent that staggers its `StaggerItem` children into view.
 */
export function Stagger({ children, ...props }: HTMLMotionProps<"div">) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? "show" : "hidden"}
      variants={containerVariants}
      viewport={{ once: true, margin: "-60px" }}
      whileInView="show"
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div variants={itemVariants} {...props}>
      {children}
    </motion.div>
  );
}
