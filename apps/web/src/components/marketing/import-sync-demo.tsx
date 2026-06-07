"use client";

import { AnimatedBeam } from "@omi/ui/animated-beam";
import { motion, useReducedMotion } from "motion/react";
import {
  type ComponentType,
  type Ref,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  GitHubLogo,
  LinearLogo,
  Markdown,
  NotionLogo,
  PocketLogo,
} from "~/components/marketing/mcp-logos";

const NODE_SPRING = { type: "spring", stiffness: 500, damping: 25 } as const;
const LOOP_MS = 6600;
const SOURCE_HALF = 18; // size-9
const OMI_HALF = 22; // size-11
const OMI_TOP_SPREAD = [-16, -8, 0, 8, 16];

type LogoComponent = ComponentType<{ className?: string }>;

interface SourceDef {
  delay: number;
  endXOffset: number;
  id: string;
  Logo: LogoComponent;
  live?: boolean;
  logoClassName?: string;
}

const SOURCES: SourceDef[] = [
  {
    id: "notion",
    Logo: NotionLogo,
    logoClassName: "size-5",
    endXOffset: OMI_TOP_SPREAD[0] ?? 0,
    delay: 0,
    live: false,
  },
  {
    id: "csv",
    Logo: PocketLogo,
    logoClassName: "size-5",
    endXOffset: OMI_TOP_SPREAD[1] ?? 0,
    delay: 0.15,
    live: false,
  },
  {
    id: "markdown",
    Logo: Markdown,
    logoClassName: "h-4 w-auto",
    endXOffset: OMI_TOP_SPREAD[2] ?? 0,
    delay: 0.3,
    live: false,
  },
  {
    id: "github",
    Logo: GitHubLogo,
    logoClassName: "size-4 text-foreground",
    endXOffset: OMI_TOP_SPREAD[3] ?? 0,
    delay: 0.45,
    live: true,
  },
  {
    id: "linear",
    Logo: LinearLogo,
    logoClassName: "size-4",
    endXOffset: OMI_TOP_SPREAD[4] ?? 0,
    delay: 0.6,
    live: true,
  },
];

export function ImportSyncDemo() {
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const omiRef = useRef<HTMLDivElement>(null);

  const notionRef = useRef<HTMLDivElement>(null);
  const csvRef = useRef<HTMLDivElement>(null);
  const markdownRef = useRef<HTMLDivElement>(null);
  const githubRef = useRef<HTMLDivElement>(null);
  const linearRef = useRef<HTMLDivElement>(null);

  const sourceRefMap: Record<string, RefObject<HTMLDivElement | null>> = {
    notion: notionRef,
    csv: csvRef,
    markdown: markdownRef,
    github: githubRef,
    linear: linearRef,
  };

  const [loopKey, setLoopKey] = useState(0);

  useEffect(() => {
    if (reduceMotion) {
      return;
    }
    const interval = setInterval(() => {
      setLoopKey((k) => k + 1);
    }, LOOP_MS);
    return () => clearInterval(interval);
  }, [reduceMotion]);

  const beamBase = {
    containerRef,
    pathColor: "var(--border)",
    pathOpacity: 0.45,
    pathWidth: 1.5,
    gradientStartColor: "#60a5fa",
    gradientStopColor: "#3b82f6",
    duration: 1.4,
    toRef: omiRef,
  };

  const beamRepeat = reduceMotion ? 0 : Number.POSITIVE_INFINITY;

  return (
    <div
      className="relative flex h-full items-center justify-center overflow-hidden"
      ref={containerRef}
    >
      <div className="relative z-10 flex w-full max-w-[220px] flex-col items-center gap-7">
        <div className="flex w-full justify-between">
          {SOURCES.map((source, i) => (
            <SourceNode
              delay={i * 0.06}
              key={source.id}
              Logo={source.Logo}
              live={source.live ?? false}
              logoClassName={source.logoClassName}
              reduceMotion={reduceMotion}
              ref={sourceRefMap[source.id]}
            />
          ))}
        </div>
        <OmiNode reduceMotion={reduceMotion} ref={omiRef} />
      </div>

      {SOURCES.map((source) => {
        const fromRef = sourceRefMap[source.id];
        if (!fromRef) {
          return null;
        }
        return (
          <AnimatedBeam
            {...beamBase}
            curvature={0}
            delay={source.delay}
            duration={source.live ? 3 : 1.4}
            endXOffset={source.endXOffset}
            endYOffset={-OMI_HALF}
            fromRef={fromRef}
            key={source.live ? source.id : `${source.id}-${loopKey}`}
            repeat={source.live ? beamRepeat : 1}
            repeatDelay={source.live ? 0 : 6}
            startYOffset={SOURCE_HALF}
          />
        );
      })}
    </div>
  );
}

function SourceNode({
  Logo,
  logoClassName,
  live,
  delay,
  reduceMotion,
  ref,
}: {
  Logo: LogoComponent;
  logoClassName?: string;
  live: boolean;
  delay: number;
  reduceMotion: boolean | null;
  ref?: Ref<HTMLDivElement>;
}) {
  return (
    <motion.div
      animate={{ opacity: 1, scale: 1 }}
      className="relative flex size-9 shrink-0 items-center justify-center rounded-lg bg-card shadow-borders-base"
      initial={
        reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.85 }
      }
      ref={ref}
      transition={{ ...NODE_SPRING, delay }}
    >
      <Logo className={logoClassName ?? "size-4"} />
      {live && !reduceMotion ? <LiveDot /> : null}
      {live && reduceMotion ? (
        <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-emerald-500 ring-2 ring-card" />
      ) : null}
    </motion.div>
  );
}

function LiveDot() {
  return (
    <motion.span
      animate={{ opacity: [1, 0.55, 1], scale: [1, 1.25, 1] }}
      className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-emerald-500 ring-2 ring-card"
      transition={{
        duration: 2,
        ease: "easeInOut",
        repeat: Number.POSITIVE_INFINITY,
      }}
    />
  );
}

function OmiNode({
  reduceMotion,
  ref,
}: {
  reduceMotion: boolean | null;
  ref?: Ref<HTMLDivElement>;
}) {
  return (
    <motion.div
      animate={{ opacity: 1, scale: 1 }}
      className="flex size-11 items-center justify-center rounded-xl bg-card shadow-borders-base"
      initial={
        reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }
      }
      ref={ref}
      transition={{ ...NODE_SPRING, delay: 0.2 }}
    >
      {/* biome-ignore lint/performance/noImgElement: official Omi logo from public/ */}
      <img
        alt=""
        className="size-7 object-contain"
        height={28}
        src="/omi_black_on_transparent.png"
        width={28}
      />
    </motion.div>
  );
}
