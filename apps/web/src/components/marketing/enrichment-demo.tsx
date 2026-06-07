"use client";

import { cn } from "@omi/ui";
import { DotmSquare1 } from "@omi/ui/dotm-square-1";
import { RiFileTextFill, RiStickyNoteFill } from "@remixicon/react";
import BoringAvatar from "boring-avatars";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { TextShimmer } from "~/components/marketing/text-shimmer";

const ICON_SPRING = { type: "spring", stiffness: 500, damping: 25 } as const;
const TITLE_SPRING = { type: "spring", stiffness: 500, damping: 30 } as const;
const ROW_SPRING = { type: "spring", stiffness: 400, damping: 34 } as const;
const ENRICH_MS = 1700; // loader runs, then the newest row resolves
const HOLD_MS = 1500; // sit still showing the enriched result
const MAX_ROWS = 6;

interface Sample {
  creator?: string;
  domain?: string;
  /** Shown (shimmering) while the resource is being enriched. */
  pendingLabel: string;
  title: string;
  type: "website" | "note" | "file";
}

const SAMPLES: Sample[] = [
  {
    type: "website",
    title: "Building effective agents",
    pendingLabel: "anthropic.com/research/building-effective-agents",
    domain: "anthropic.com",
  },
  {
    type: "website",
    title: "System Design Primer",
    pendingLabel: "github.com/donnemartin/system-design-primer",
    domain: "github.com",
    creator: "Dev Kumar",
  },
  {
    type: "note",
    title: "Q3 planning notes",
    pendingLabel: "Q3 planning notes",
  },
  {
    type: "website",
    title: "Usage-based billing",
    pendingLabel: "docs.stripe.com/billing/subscriptions/usage-based",
    domain: "stripe.com",
  },
  {
    type: "file",
    title: "Q3 board deck.pdf",
    pendingLabel: "Q3 board deck.pdf",
    creator: "Sarah Lee",
  },
  {
    type: "website",
    title: "Attention Is All You Need",
    pendingLabel: "arxiv.org/abs/1706.03762",
    domain: "arxiv.org",
  },
  {
    type: "website",
    title: "How Linear builds",
    pendingLabel: "linear.app/method",
    domain: "linear.app",
  },
  {
    type: "note",
    title: "Tokyo trip itinerary",
    pendingLabel: "Tokyo trip itinerary",
  },
  {
    type: "website",
    title: "Show HN: a tiny local-first database",
    pendingLabel: "news.ycombinator.com/item?id=39247898",
    domain: "news.ycombinator.com",
  },
  {
    type: "website",
    title: "Karpathy — Intro to LLMs",
    pendingLabel: "youtube.com/watch?v=zjkBMFhNj_g",
    domain: "youtube.com",
  },
  {
    type: "website",
    title: "Transformer (deep learning)",
    pendingLabel: "en.wikipedia.org/wiki/Transformer",
    domain: "wikipedia.org",
  },
  {
    type: "file",
    title: "Brand guidelines.pdf",
    pendingLabel: "Brand guidelines.pdf",
    creator: "Maya Chen",
  },
  {
    type: "website",
    title: "Next.js App Router",
    pendingLabel: "nextjs.org/docs/app",
    domain: "nextjs.org",
  },
  {
    type: "note",
    title: "Book highlights — Thinking, Fast and Slow",
    pendingLabel: "Book highlights — Thinking, Fast and Slow",
  },
  {
    type: "website",
    title: "Refactoring UI",
    pendingLabel: "refactoringui.com",
    domain: "refactoringui.com",
  },
  {
    type: "website",
    title: "Tailwind CSS — Docs",
    pendingLabel: "tailwindcss.com/docs",
    domain: "tailwindcss.com",
  },
];

interface Row {
  id: number;
  sample: Sample;
  status: "pending" | "resolved";
}

const INITIAL: Row[] = SAMPLES.slice(0, 5).map((sample, i) => ({
  id: i,
  sample,
  status: i === 0 ? "pending" : "resolved",
}));

export function EnrichmentDemo() {
  const reduceMotion = useReducedMotion();
  const [rows, setRows] = useState<Row[]>(INITIAL);
  const idRef = useRef(INITIAL.length - 1);
  const poolRef = useRef(INITIAL.length);

  useEffect(() => {
    if (reduceMotion) {
      setRows((prev) => prev.map((r) => ({ ...r, status: "resolved" })));
      return;
    }
    let timer: ReturnType<typeof setTimeout>;

    // Top row finishes enriching, holds, then the next resource saves in.
    const resolveTop = () => {
      setRows((prev) =>
        prev.map((r, i) => (i === 0 ? { ...r, status: "resolved" } : r))
      );
      timer = setTimeout(addNext, HOLD_MS);
    };

    const addNext = () => {
      const sample = SAMPLES[poolRef.current % SAMPLES.length];
      if (sample) {
        poolRef.current += 1;
        idRef.current += 1;
        const next: Row = { id: idRef.current, sample, status: "pending" };
        setRows((prev) => [next, ...prev].slice(0, MAX_ROWS));
      }
      timer = setTimeout(resolveTop, ENRICH_MS);
    };

    // Initial top row starts pending → resolve it after a beat.
    timer = setTimeout(resolveTop, ENRICH_MS);
    return () => clearTimeout(timer);
  }, [reduceMotion]);

  return (
    <div className="relative -mr-4 -mb-4 h-[calc(100%+1rem)] overflow-hidden [mask-image:linear-gradient(to_bottom,black_45%,transparent)]">
      {/* Wider than the box → rows run off the right, like a zoomed-in list */}
      <div className="absolute top-0 left-0 w-[400px] [mask-image:linear-gradient(to_right,black_72%,transparent)]">
        <AnimatePresence initial={false}>
          {rows.map((row) => (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              initial={
                reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -6 }
              }
              key={row.id}
              layout
              transition={ROW_SPRING}
            >
              <ResourceRowMock reduceMotion={reduceMotion} row={row} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ResourceRowMock({
  row,
  reduceMotion,
}: {
  row: Row;
  reduceMotion: boolean | null;
}) {
  const { sample, status } = row;
  const pending = status === "pending";
  const boxedIcon = !pending && sample.type !== "website";

  return (
    <div className="group relative flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-ui-bg-component-hover">
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-md",
          boxedIcon && "bg-ui-bg-subtle text-ui-fg-muted"
        )}
      >
        <AnimatePresence initial={false} mode="wait">
          {pending ? (
            <motion.div
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              key="loader"
              transition={{ duration: 0.15 }}
            >
              <DotmSquare1 dotSize={2} size={16} speed={1} />
            </motion.div>
          ) : (
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center"
              initial={
                reduceMotion
                  ? { opacity: 1, scale: 1 }
                  : { opacity: 0, scale: 0.5 }
              }
              key="icon"
              transition={ICON_SPRING}
            >
              <ResolvedIcon sample={sample} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <AnimatePresence initial={false} mode="wait">
          {pending ? (
            <motion.div
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              key="shimmer"
            >
              <TextShimmer className="block whitespace-nowrap font-medium text-sm">
                {sample.pendingLabel}
              </TextShimmer>
            </motion.div>
          ) : (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              initial={
                reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 4 }
              }
              key="title"
              transition={TITLE_SPRING}
            >
              <span className="block whitespace-nowrap font-medium text-sm text-ui-fg-base">
                {sample.title}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {sample.creator ? (
        <span className="size-5 shrink-0 overflow-hidden rounded-full">
          <BoringAvatar name={sample.creator} size={20} variant="marble" />
        </span>
      ) : null}
    </div>
  );
}

function ResolvedIcon({ sample }: { sample: Sample }) {
  if (sample.type === "website" && sample.domain) {
    return (
      // biome-ignore lint/performance/noImgElement: external favicon
      <img
        alt=""
        className="size-6 shrink-0 rounded-sm"
        height={24}
        src={`https://www.google.com/s2/favicons?domain=${sample.domain}&sz=64`}
        width={24}
      />
    );
  }
  const Icon = sample.type === "note" ? RiStickyNoteFill : RiFileTextFill;
  return <Icon className="size-4" />;
}
