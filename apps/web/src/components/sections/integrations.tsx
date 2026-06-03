"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  GitHubIcon,
  NotionIcon,
  OmiMark,
  ReadwiseIcon,
  SlackIcon,
} from "~/components/marketing/brand-icons";
import { Eyebrow } from "~/components/marketing/eyebrow";
import { Section } from "~/components/marketing/section";

const EASE: [number, number, number, number] = [0.21, 0.47, 0.32, 0.98];

// Staggered cross cluster, like the reference — Omi at center-top.
const cluster = [
  { Icon: GitHubIcon, label: "GitHub", x: -84, y: 10, delay: 0.05 },
  { Icon: OmiMark, label: "Omi", x: 0, y: -36, delay: 0, accent: true },
  { Icon: SlackIcon, label: "Slack", x: 84, y: 10, delay: 0.1 },
  { Icon: NotionIcon, label: "Notion", x: -28, y: 64, delay: 0.15 },
  { Icon: ReadwiseIcon, label: "Readwise", x: 56, y: 70, delay: 0.2 },
];

const FIELD_COLS = 9;
const FIELD_ROWS = 5;
const fieldTiles = Array.from(
  { length: FIELD_COLS * FIELD_ROWS },
  (_, i) => `tile-${i}`
);

export function Integrations() {
  const reduceMotion = useReducedMotion();

  return (
    <Section ariaLabel="Integrations" id="integrations">
      <div className="relative flex flex-col items-center">
        {/* Faint recessed field */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 -z-0 grid gap-3 [mask-image:radial-gradient(60%_70%_at_50%_30%,black,transparent)]"
          style={{
            gridTemplateColumns: `repeat(${FIELD_COLS}, minmax(0, 1fr))`,
          }}
        >
          {fieldTiles.map((tile) => (
            <div
              className="aspect-square rounded-xl border border-border/60 bg-accent/40"
              key={tile}
            />
          ))}
        </div>

        {/* Active cluster */}
        <div className="relative z-10 mb-10 h-56 w-full max-w-md">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2">
            {cluster.map((tile) => {
              const Icon = tile.Icon;
              return (
                <motion.div
                  animate={
                    reduceMotion
                      ? undefined
                      : { y: [tile.y, tile.y - 6, tile.y] }
                  }
                  className="absolute flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border border-border bg-card shadow-glow"
                  initial={
                    reduceMotion
                      ? { opacity: 1, x: tile.x, y: tile.y }
                      : { opacity: 0, scale: 0.6, x: tile.x, y: tile.y }
                  }
                  key={tile.label}
                  style={{ left: 0, top: 0 }}
                  transition={
                    reduceMotion
                      ? undefined
                      : {
                          opacity: {
                            duration: 0.4,
                            delay: tile.delay,
                            ease: EASE,
                          },
                          scale: {
                            duration: 0.4,
                            delay: tile.delay,
                            ease: EASE,
                          },
                          y: {
                            duration: 4,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "easeInOut",
                            delay: tile.delay,
                          },
                        }
                  }
                  viewport={{ once: true, margin: "-80px" }}
                  whileInView={
                    reduceMotion ? undefined : { opacity: 1, scale: 1 }
                  }
                >
                  <Icon
                    className={
                      tile.accent
                        ? "size-7 text-blue-500"
                        : "size-7 text-foreground"
                    }
                  />
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <Eyebrow>Integrations</Eyebrow>
          <h2 className="mt-5 text-balance text-3xl text-display text-foreground">
            Plugs into what your team already uses.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Connects in seconds, no code required.
          </p>
        </div>
      </div>
    </Section>
  );
}
