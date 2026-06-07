"use client";

import { cn } from "@omi/ui";
import { RiStickyNoteFill } from "@remixicon/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

const ROW_SPRING = { type: "spring", stiffness: 420, damping: 30 } as const;
const GHOST_SPRING = { type: "spring", stiffness: 220, damping: 32 } as const;
const OVERLAY_SPRING = { type: "spring", duration: 0.3, bounce: 0 } as const;

const OVERLAY_SIZE = 40;
// Nudge the overlay right of the row's icon so it doesn't block it.
const OVERLAY_X_OFFSET = 22;
// Pointer tip anchors here, offset from the overlay top-left.
const CURSOR_OFFSET = { x: 30, y: 30 };

const IDLE_MS = 1200;
const LIFT_MS = 120;
const DRAG_MS = 1500;
const HOLD1_MS = 1000;
const HOLD2_MS = 1500;
const RESET_MS = 400;

type ItemKind = "collection" | "note" | "website";

interface LibraryItem {
  domain?: string;
  emoji?: string;
  id: string;
  kind: ItemKind;
  name: string;
}

const ALL_ITEMS: LibraryItem[] = [
  { id: "work", kind: "collection", name: "Work", emoji: "💼" },
  { id: "research", kind: "collection", name: "Research", emoji: "🔬" },
  { id: "ai-papers", kind: "collection", name: "AI Papers", emoji: "🤖" },
  { id: "q3-notes", kind: "note", name: "Q3 planning notes" },
  {
    id: "stripe",
    kind: "website",
    name: "Stripe billing docs",
    domain: "stripe.com",
  },
];

const INITIAL_IDS = ALL_ITEMS.map((i) => i.id);
const REDUCED_MOTION_IDS = INITIAL_IDS.filter((id) => id !== "q3-notes");

type Phase =
  | "idle"
  | "drag1-lift"
  | "drag1-move"
  | "drag1-drop"
  | "hold1"
  | "drag2-lift"
  | "drag2-move"
  | "drag2-drop"
  | "hold2"
  | "reset";

interface GhostState {
  item: LibraryItem;
  x: number;
  y: number;
}

function getItem(id: string): LibraryItem {
  const item = ALL_ITEMS.find((i) => i.id === id);
  if (!item) {
    throw new Error(`Unknown item: ${id}`);
  }
  return item;
}

function measureOverlayPos(
  container: HTMLElement,
  row: HTMLElement
): { x: number; y: number } {
  const c = container.getBoundingClientRect();
  const r = row.getBoundingClientRect();
  // Sit just right of the row's icon tile so the overlay doesn't cover it.
  return {
    x: r.left - c.left + 12 + OVERLAY_X_OFFSET,
    y: r.top - c.top + (r.height - OVERLAY_SIZE) / 2,
  };
}

export function CollectionsDemo() {
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [visibleIds, setVisibleIds] = useState<string[]>(
    reduceMotion ? REDUCED_MOTION_IDS : INITIAL_IDS
  );
  const [phase, setPhase] = useState<Phase>("idle");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [ghost, setGhost] = useState<GhostState | null>(null);

  const setRowRef = useCallback((id: string, el: HTMLDivElement | null) => {
    rowRefs.current[id] = el;
  }, []);

  const measure = useCallback((sourceId: string, targetId?: string) => {
    const container = containerRef.current;
    const sourceRow = rowRefs.current[sourceId];
    if (!(container && sourceRow)) {
      return null;
    }
    if (!targetId) {
      const start = measureOverlayPos(container, sourceRow);
      return { ...start, item: getItem(sourceId) };
    }
    const targetRow = rowRefs.current[targetId];
    if (!targetRow) {
      return null;
    }
    const end = measureOverlayPos(container, targetRow);
    return { ...end, item: getItem(sourceId) };
  }, []);

  useLayoutEffect(() => {
    if (reduceMotion) {
      return;
    }

    if (phase === "drag1-lift") {
      const pos = measure("q3-notes");
      if (pos) {
        setGhost(pos);
      }
    } else if (phase === "drag1-move") {
      const pos = measure("q3-notes", "work");
      if (pos) {
        setGhost(pos);
      }
    } else if (phase === "drag2-lift") {
      const pos = measure("ai-papers");
      if (pos) {
        setGhost(pos);
      }
    } else if (phase === "drag2-move") {
      const pos = measure("ai-papers", "research");
      if (pos) {
        setGhost(pos);
      }
    }
  }, [phase, measure, reduceMotion]);

  useEffect(() => {
    if (reduceMotion) {
      return;
    }

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const push = (fn: () => void, ms: number) => {
      timers.push(
        setTimeout(() => {
          if (!cancelled) {
            fn();
          }
        }, ms)
      );
    };

    const reset = () => {
      setVisibleIds(INITIAL_IDS);
      setDraggingId(null);
      setDropTargetId(null);
      setGhost(null);
      setPhase("idle");
    };

    const runLoop = () => {
      reset();

      push(() => {
        setDraggingId("q3-notes");
        setPhase("drag1-lift");
      }, IDLE_MS);

      push(() => {
        setDropTargetId("work");
        setPhase("drag1-move");
      }, IDLE_MS + LIFT_MS);

      push(
        () => {
          setPhase("drag1-drop");
          setDraggingId(null);
          setDropTargetId(null);
          setGhost(null);
          setVisibleIds((prev) => prev.filter((id) => id !== "q3-notes"));
        },
        IDLE_MS + LIFT_MS + DRAG_MS
      );

      push(() => setPhase("hold1"), IDLE_MS + LIFT_MS + DRAG_MS + 200);

      const beat2Start = IDLE_MS + LIFT_MS + DRAG_MS + 200 + HOLD1_MS;

      push(() => {
        setDraggingId("ai-papers");
        setPhase("drag2-lift");
      }, beat2Start);

      push(() => {
        setDropTargetId("research");
        setPhase("drag2-move");
      }, beat2Start + LIFT_MS);

      push(
        () => {
          setPhase("drag2-drop");
          setDraggingId(null);
          setDropTargetId(null);
          setGhost(null);
          setVisibleIds((prev) => prev.filter((id) => id !== "ai-papers"));
        },
        beat2Start + LIFT_MS + DRAG_MS
      );

      push(() => setPhase("hold2"), beat2Start + LIFT_MS + DRAG_MS + 200);

      const loopEnd =
        beat2Start + LIFT_MS + DRAG_MS + 200 + HOLD2_MS + RESET_MS;

      push(() => {
        setPhase("reset");
        reset();
        runLoop();
      }, loopEnd);
    };

    runLoop();

    return () => {
      cancelled = true;
      for (const t of timers) {
        clearTimeout(t);
      }
    };
  }, [reduceMotion]);

  const items = visibleIds
    .map((id) => ALL_ITEMS.find((i) => i.id === id))
    .filter((i): i is LibraryItem => i !== undefined);

  return (
    <div
      className="relative -mr-4 h-full overflow-hidden [mask-image:linear-gradient(to_bottom,black_82%,transparent)]"
      ref={containerRef}
    >
      {/* Horizontal padding keeps inset rings and overlay shadow inside the clip. */}
      <div className="absolute inset-0 pt-0.5 pr-1.5 pb-1 pl-8">
        <div className="w-[400px] [mask-image:linear-gradient(to_right,black_72%,transparent)]">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                initial={
                  reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -6 }
                }
                key={item.id}
                layout
                ref={(el) => setRowRef(item.id, el)}
                transition={ROW_SPRING}
              >
                <LibraryRow
                  dragging={draggingId === item.id}
                  dropTarget={dropTargetId === item.id}
                  item={item}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {ghost && !reduceMotion ? (
            <>
              <DragOverlay
                item={ghost.item}
                key="overlay"
                x={ghost.x}
                y={ghost.y}
              />
              <DragCursor
                key="cursor"
                x={ghost.x + CURSOR_OFFSET.x}
                y={ghost.y + CURSOR_OFFSET.y}
              />
            </>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

function LibraryRow({
  item,
  dragging,
  dropTarget,
}: {
  item: LibraryItem;
  dragging: boolean;
  dropTarget: boolean;
}) {
  return (
    <div
      className={cn(
        "relative flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
        dragging && "opacity-50",
        dropTarget &&
          "bg-ui-bg-subtle-hover ring-2 ring-ui-fg-interactive ring-inset"
      )}
    >
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-md bg-ui-bg-subtle",
          item.kind === "collection" ? "text-base" : "text-ui-fg-muted"
        )}
      >
        <RowIcon item={item} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="block truncate font-medium text-sm text-ui-fg-base">
          {item.name}
        </span>
      </div>
    </div>
  );
}

function RowIcon({ item }: { item: LibraryItem }) {
  if (item.kind === "collection" && item.emoji) {
    return <span className="text-base leading-none">{item.emoji}</span>;
  }
  if (item.kind === "website" && item.domain) {
    return (
      // biome-ignore lint/performance/noImgElement: external favicon
      <img
        alt=""
        className="size-6 shrink-0 rounded-sm"
        height={24}
        src={`https://www.google.com/s2/favicons?domain=${item.domain}&sz=64`}
        width={24}
      />
    );
  }
  return <RiStickyNoteFill className="size-4" />;
}

/** Mirrors LibraryDragOverlay from the app library page. */
function DragOverlay({
  item,
  x,
  y,
}: {
  item: LibraryItem;
  x: number;
  y: number;
}) {
  return (
    <motion.div
      animate={{ opacity: 1, scale: 1, x, y }}
      className="pointer-events-none absolute top-0 left-0 z-20 drop-shadow-md"
      exit={{ opacity: 0, scale: 0.6 }}
      initial={{ opacity: 0, scale: 0.4, x, y }}
      transition={GHOST_SPRING}
    >
      <motion.div
        animate={{ opacity: 1, scale: 1 }}
        className="relative size-10"
        initial={{ opacity: 0, scale: 0.4 }}
        transition={OVERLAY_SPRING}
      >
        <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-lg border-[0.5px] bg-ui-bg-component text-ui-fg-base shadow-sm">
          <OverlayIcon item={item} />
        </div>
      </motion.div>
    </motion.div>
  );
}

function OverlayIcon({ item }: { item: LibraryItem }) {
  if (item.kind === "collection" && item.emoji) {
    return <span className="text-lg leading-none">{item.emoji}</span>;
  }
  if (item.kind === "website" && item.domain) {
    return (
      // biome-ignore lint/performance/noImgElement: external favicon
      <img
        alt=""
        className="size-6 shrink-0 rounded-sm"
        height={24}
        src={`https://www.google.com/s2/favicons?domain=${item.domain}&sz=64`}
        width={24}
      />
    );
  }
  return (
    <span className="text-ui-fg-muted">
      <RiStickyNoteFill className="size-4" />
    </span>
  );
}

function DragCursor({ x, y }: { x: number; y: number }) {
  return (
    <motion.div
      animate={{ opacity: 1, x, y }}
      className="pointer-events-none absolute top-0 left-[7px] z-30"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0, x, y }}
      transition={GHOST_SPRING}
    >
      <svg
        aria-hidden="true"
        className="size-4 text-ui-fg-base drop-shadow-md"
        fill="currentColor"
        viewBox="0 0 16 16"
      >
        <title>Drag cursor</title>
        <path d="M1 1l5.5 13 2-5.5 5.5-2z" />
      </svg>
    </motion.div>
  );
}
