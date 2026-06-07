"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ComponentType } from "react";
import { FeatureSplit } from "~/components/marketing/feature-split";
import {
  GitHubLogo,
  GmailLogo,
  GoogleCalendarLogo,
  GoogleDriveLogo,
  LinearLogo,
  NotionLogo,
  SlackLogo,
} from "~/components/marketing/mcp-logos";
import { Section } from "~/components/marketing/section";

const EASE: [number, number, number, number] = [0.21, 0.47, 0.32, 0.98];

const FIELD_COLS = 9;
const FIELD_ROWS = 5;

interface ActiveTile {
  col: number;
  delay: number;
  Logo?: ComponentType<{ className?: string }>;
  label: string;
  logoClassName?: string;
  omi?: boolean;
  row: number;
}

const ACTIVE_TILES: ActiveTile[] = [
  { row: 0, col: 4, label: "Omi", omi: true, delay: 0 },
  {
    row: 1,
    col: 4,
    label: "Linear",
    Logo: LinearLogo,
    logoClassName: "size-7",
    delay: 0.05,
  },
  {
    row: 1,
    col: 3,
    label: "GitHub",
    Logo: GitHubLogo,
    logoClassName: "size-7 text-foreground",
    delay: 0.1,
  },
  {
    row: 1,
    col: 5,
    label: "Slack",
    Logo: SlackLogo,
    logoClassName: "size-7",
    delay: 0.15,
  },
  {
    row: 1,
    col: 6,
    label: "Gmail",
    Logo: GmailLogo,
    logoClassName: "size-7",
    delay: 0.2,
  },
  {
    row: 2,
    col: 4,
    label: "Google Drive",
    Logo: GoogleDriveLogo,
    logoClassName: "size-7",
    delay: 0.25,
  },
  {
    row: 2,
    col: 3,
    label: "Notion",
    Logo: NotionLogo,
    logoClassName: "size-7",
    delay: 0.3,
  },
  {
    row: 1,
    col: 2,
    label: "Google Calendar",
    Logo: GoogleCalendarLogo,
    logoClassName: "size-7",
    delay: 0.4,
  },
];

const activeByCell = new Map(
  ACTIVE_TILES.map((tile) => [`${tile.row}-${tile.col}`, tile])
);

export function Integrations() {
  const reduceMotion = useReducedMotion();

  return (
    <Section ariaLabel="Integrations" id="integrations">
      <FeatureSplit
        body="Sync Notion, GitHub, Linear, Google Workspace, and Slack via OAuth — connects in seconds, no code required."
        eyebrow="Integrations"
        title="Plugs into what your team already uses."
        visual={<IntegrationsGrid reduceMotion={reduceMotion} />}
      />
    </Section>
  );
}

function IntegrationsGrid({ reduceMotion }: { reduceMotion: boolean | null }) {
  return (
    <div
      aria-hidden="true"
      className="mask-[radial-gradient(60%_80%_at_50%_38%,black,transparent)] w-full max-w-2xl pt-1"
    >
      <div
        className="grid gap-3"
        style={{
          gridTemplateColumns: `repeat(${FIELD_COLS}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: FIELD_COLS * FIELD_ROWS }, (_, i) => {
          const row = Math.floor(i / FIELD_COLS);
          const col = i % FIELD_COLS;
          const active = activeByCell.get(`${row}-${col}`);

          return (
            <GridCell
              active={active}
              key={`${row}-${col}`}
              reduceMotion={reduceMotion}
            />
          );
        })}
      </div>
    </div>
  );
}

function GridCell({
  active,
  reduceMotion,
}: {
  active?: ActiveTile;
  reduceMotion: boolean | null;
}) {
  const Logo = active?.Logo;

  return (
    <div className="relative aspect-square">
      <div className="absolute inset-0 rounded-xl border border-border/60 bg-accent/40" />

      {active ? (
        <motion.div
          aria-label={active.label}
          className={
            active.omi
              ? "absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-card shadow-borders-base"
              : "absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-card shadow-borders-base"
          }
          initial={
            reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }
          }
          role="img"
          transition={
            reduceMotion
              ? undefined
              : {
                  opacity: { duration: 0.4, delay: active.delay, ease: EASE },
                  scale: { duration: 0.4, delay: active.delay, ease: EASE },
                }
          }
          viewport={{ once: true, margin: "-80px" }}
          whileInView={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
        >
          {active.omi ? (
            // biome-ignore lint/performance/noImgElement: official Omi logo from public/
            <img
              alt=""
              className="size-8 object-contain"
              height={32}
              src="/omi_black_on_transparent.png"
              width={32}
            />
          ) : Logo ? (
            <Logo className={active.logoClassName} />
          ) : null}
        </motion.div>
      ) : null}
    </div>
  );
}
