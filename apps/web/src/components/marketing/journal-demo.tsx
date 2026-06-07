"use client";

import { Button } from "@omi/ui/button";
import { RiAddLine, RiStickyNoteFill } from "@remixicon/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const SPRING = { type: "spring", stiffness: 420, damping: 30 } as const;
const TICK_MS = 2200;
const MAX = 6;

const DATES = [
  "Mon, 2 Jun",
  "Tue, 3 Jun",
  "Wed, 4 Jun",
  "Thu, 5 Jun",
  "Fri, 6 Jun",
  "Sat, 7 Jun",
  "Sun, 8 Jun",
  "Mon, 9 Jun",
  "Tue, 10 Jun",
  "Wed, 11 Jun",
  "Thu, 12 Jun",
  "Fri, 13 Jun",
];

interface Entry {
  date: string;
  id: number;
}

// Newest at top.
const INITIAL: Entry[] = DATES.slice(0, 4)
  .map((date, i) => ({ id: i, date }))
  .reverse();

export function JournalDemo() {
  const reduceMotion = useReducedMotion();
  const [rows, setRows] = useState<Entry[]>(INITIAL);
  const [pressed, setPressed] = useState(false);
  const idRef = useRef(INITIAL.length - 1);
  const poolRef = useRef(INITIAL.length);

  useEffect(() => {
    if (reduceMotion) {
      return;
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    const interval = setInterval(() => {
      setPressed(true);
      idRef.current += 1;
      const date = DATES[poolRef.current % DATES.length] ?? "Today";
      poolRef.current += 1;
      const id = idRef.current;
      setRows((prev) => [{ id, date }, ...prev].slice(0, MAX));
      timers.push(setTimeout(() => setPressed(false), 220));
    }, TICK_MS);
    return () => {
      clearInterval(interval);
      for (const t of timers) {
        clearTimeout(t);
      }
    };
  }, [reduceMotion]);

  return (
    <div className="relative h-full min-h-0">
      <div className="absolute top-0 right-0 z-20">
        <motion.div animate={{ scale: pressed ? 0.95 : 1 }} transition={SPRING}>
          <Button size="small" variant="omi">
            <RiAddLine className="size-4" />
            Today's entry
          </Button>
        </motion.div>
      </div>

      <div className="relative -mr-4 -mb-4 h-[calc(100%+1rem)] overflow-hidden">
        <div className="relative z-0 -mx-3 flex flex-col pt-10 [mask-image:linear-gradient(to_bottom,black_45%,transparent)]">
          <AnimatePresence initial={false}>
            {rows.map((entry, i) => (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                initial={
                  reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -6 }
                }
                key={entry.id}
                layout
                transition={SPRING}
              >
                <EntryRow date={entry.date} today={i === 0} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-t from-card to-transparent"
        />
      </div>
    </div>
  );
}

function EntryRow({ date }: { date: string; today: boolean }) {
  return (
    <div className="flex items-center gap-3 rounded-lg px-3 py-2">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-card text-ui-fg-muted">
        <RiStickyNoteFill className="size-4" />
      </div>
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className="font-medium text-sm text-ui-fg-base">{date}</span>
      </div>
    </div>
  );
}
