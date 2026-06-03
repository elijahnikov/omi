"use client";

import { motion, useReducedMotion } from "motion/react";
import { Eyebrow } from "~/components/marketing/eyebrow";
import { Section } from "~/components/marketing/section";

const EASE: [number, number, number, number] = [0.21, 0.47, 0.32, 0.98];

const gnodes = [
  { x: 150, y: 60, r: 10, accent: true },
  { x: 60, y: 130, r: 7, accent: false },
  { x: 250, y: 110, r: 8, accent: false },
  { x: 120, y: 210, r: 7, accent: false },
  { x: 300, y: 200, r: 6, accent: false },
  { x: 220, y: 250, r: 7, accent: false },
  { x: 40, y: 230, r: 6, accent: false },
];
const glines = [
  { x1: 150, y1: 60, x2: 60, y2: 130 },
  { x1: 150, y1: 60, x2: 250, y2: 110 },
  { x1: 60, y1: 130, x2: 120, y2: 210 },
  { x1: 250, y1: 110, x2: 300, y2: 200 },
  { x1: 120, y1: 210, x2: 220, y2: 250 },
  { x1: 300, y1: 200, x2: 220, y2: 250 },
  { x1: 60, y1: 130, x2: 40, y2: 230 },
];

export function SmartConnections() {
  const reduceMotion = useReducedMotion();

  return (
    <Section
      ariaLabel="Smart connections"
      className="border-border border-y bg-sidebar"
    >
      <div className="flex flex-col">
        <div className="flex flex-col">
          <Eyebrow>Connections</Eyebrow>
          <h2 className="mt-5 text-balance text-3xl text-display text-foreground">
            Auto-linked by meaning.
          </h2>
          <p className="mt-4 max-w-md font-medium text-sm text-ui-fg-muted">
            Omi connects related notes by shared concepts and similarity — no
            manual tagging. Your knowledge graph gets richer every time you save
            something.
          </p>
        </div>

        <div className="relative mt-10 w-full max-w-md">
          <svg
            aria-hidden="true"
            className="h-auto w-full"
            viewBox="0 0 340 300"
          >
            <title>Knowledge graph</title>
            {glines.map((l) => (
              <motion.line
                initial={reduceMotion ? { pathLength: 1 } : { pathLength: 0 }}
                key={`${l.x1}-${l.y1}-${l.x2}-${l.y2}`}
                stroke="var(--border)"
                strokeWidth="1.5"
                transition={{ duration: 1, ease: EASE }}
                viewport={{ once: true, margin: "-80px" }}
                whileInView={{ pathLength: 1 }}
                x1={l.x1}
                x2={l.x2}
                y1={l.y1}
                y2={l.y2}
              />
            ))}
            {gnodes.map((n, i) => (
              <motion.circle
                animate={
                  n.accent && !reduceMotion
                    ? { scale: [1, 1.12, 1] }
                    : undefined
                }
                cx={n.x}
                cy={n.y}
                fill={n.accent ? "var(--color-blue-500)" : "var(--card)"}
                initial={reduceMotion ? { scale: 1 } : { scale: 0 }}
                key={`${n.x}-${n.y}`}
                r={n.r}
                stroke={n.accent ? "var(--color-blue-500)" : "var(--border)"}
                strokeWidth="1.5"
                style={{ transformOrigin: "center", transformBox: "fill-box" }}
                transition={
                  n.accent && !reduceMotion
                    ? {
                        duration: 3,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                      }
                    : { duration: 0.4, delay: 0.3 + i * 0.08, ease: EASE }
                }
                viewport={{ once: true, margin: "-80px" }}
                whileInView={reduceMotion ? undefined : { scale: 1 }}
              />
            ))}
          </svg>
        </div>
      </div>
    </Section>
  );
}
