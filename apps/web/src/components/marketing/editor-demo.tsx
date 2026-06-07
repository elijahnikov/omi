"use client";

import { cn } from "@omi/ui";
import { RiCheckLine } from "@remixicon/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

const SPRING = { type: "spring", stiffness: 320, damping: 26 } as const;
const POP = { type: "spring", stiffness: 600, damping: 22 } as const;

const TYPE_MS = 42;
const TYPE_HOLD_MS = 2600;

const PART_A = "Targeting Friday for launch. ";
const MENTION = "@Marcus";
const PART_B = " owns the API work.";

const SOFIA = "#ec4899";
const MARCUS = "#8b5cf6";

const ROW_H = 22;
const MOVE_MS = 900;
const TICK_MS = 260;
const CHECK_HOLD_MS = 600;

const NOTE_LEAD = "Decision: ";
const NOTE_PHRASE = "ship the core flow first";
const NOTE_TAIL = " — polish can wait.";

const SWEEP_MS = 420;

const ITEMS = [
  "Finalize onboarding designs",
  "Ship API endpoints",
  "QA + polish pass",
];

export function EditorDemo() {
  const reduceMotion = useReducedMotion();
  const [typedA, setTypedA] = useState("");
  const [mentionShown, setMentionShown] = useState(false);
  const [typedB, setTypedB] = useState("");
  const [checked, setChecked] = useState<boolean[]>([false, false, false]);
  const [activeItem, setActiveItem] = useState(0);
  const [phase, setPhase] = useState<"list" | "format">("list");
  const [selecting, setSelecting] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const phraseRef = useRef<HTMLSpanElement>(null);
  const [phraseBox, setPhraseBox] = useState({ startX: 8, endX: 8, y: 80 });

  // Measure the phrase so the pointer can ride its selection edge precisely.
  const measure = useCallback(() => {
    const container = containerRef.current;
    const phrase = phraseRef.current;
    if (!(container && phrase)) {
      return;
    }
    const c = container.getBoundingClientRect();
    const p = phrase.getBoundingClientRect();
    setPhraseBox({
      startX: p.left - c.left,
      endX: p.right - c.left,
      y: p.top - c.top,
    });
  }, []);

  useLayoutEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  // Re-measure right before the pointer needs it (fonts/layout fully settled).
  useEffect(() => {
    if (phase !== "format") {
      return;
    }
    const id = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(id);
  }, [phase, measure]);

  // Sofia types the note; her caret follows the end of the line.
  useEffect(() => {
    if (reduceMotion) {
      setTypedA(PART_A);
      setMentionShown(true);
      setTypedB(PART_B);
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

    const typeB = (n: number) => {
      if (n <= PART_B.length) {
        setTypedB(PART_B.slice(0, n));
        push(() => typeB(n + 1), TYPE_MS);
        return;
      }
      push(() => {
        setTypedA("");
        setMentionShown(false);
        setTypedB("");
        push(() => typeA(0), 450);
      }, TYPE_HOLD_MS);
    };

    const typeA = (n: number) => {
      if (n <= PART_A.length) {
        setTypedA(PART_A.slice(0, n));
        push(() => typeA(n + 1), TYPE_MS);
        return;
      }
      setMentionShown(true);
      push(() => typeB(0), 320);
    };

    typeA(0);
    return () => {
      cancelled = true;
      for (const t of timers) {
        clearTimeout(t);
      }
    };
  }, [reduceMotion]);

  // Marcus ticks each box, then selects the note line and formats it.
  useEffect(() => {
    if (reduceMotion) {
      setChecked([true, true, true]);
      setActiveItem(ITEMS.length - 1);
      setPhase("format");
      setSelecting(true);
      setShowToolbar(true);
      setBold(true);
      setItalic(true);
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
      setChecked([false, false, false]);
      setActiveItem(0);
      setPhase("list");
      setSelecting(false);
      setShowToolbar(false);
      setBold(false);
      setItalic(false);
    };

    const format = () => {
      setPhase("format");
      // Pointer glides to the line, then drags a selection across the phrase.
      push(() => setSelecting(true), MOVE_MS);
      push(() => setShowToolbar(true), MOVE_MS + 520);
      push(() => setBold(true), MOVE_MS + 820);
      push(() => setItalic(true), MOVE_MS + 1320);
      push(
        () => {
          reset();
          push(() => run(0), MOVE_MS);
        },
        MOVE_MS + 1320 + 2200
      );
    };

    const run = (i: number) => {
      if (i >= ITEMS.length) {
        push(() => format(), CHECK_HOLD_MS);
        return;
      }
      setActiveItem(i);
      push(() => {
        setChecked((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
        push(() => run(i + 1), TICK_MS);
      }, MOVE_MS);
    };

    run(0);
    return () => {
      cancelled = true;
      for (const t of timers) {
        clearTimeout(t);
      }
    };
  }, [reduceMotion]);

  const inFormat = phase === "format";
  // The pointer's arrow tip sits ~7px right of the element's left anchor.
  const pointerX = inFormat
    ? (selecting ? phraseBox.endX : phraseBox.startX) - 7
    : 0;
  const pointerY = inFormat
    ? phraseBox.y + 2
    : activeItem * ROW_H + ROW_H / 2 - 1;
  const dragging = inFormat && selecting;

  return (
    <div className="relative -mr-8 -mb-8 ml-6 h-[calc(100%+2rem)] overflow-hidden rounded-lg bg-card p-3 shadow-borders-base">
      <div className="flex flex-col gap-1">
        <h3 className="font-semibold text-[13px] text-foreground leading-tight">
          Q3 launch plan
        </h3>

        <p className="text-[13px] text-ui-fg-base leading-snug">
          <span>{typedA}</span>
          {mentionShown ? (
            <span className="rounded-[4px] bg-blue-50 px-1 py-0.5 font-medium text-blue-700">
              {MENTION}
            </span>
          ) : null}
          <span>{typedB}</span>
          <TypingCaret color={SOFIA} name="Sofia" />
        </p>

        {/* Checklist + note — Marcus ticks the boxes, then formats the line */}
        <div className="relative" ref={containerRef}>
          <div className="flex flex-col">
            {ITEMS.map((item, i) => (
              <div
                className="flex items-center gap-2 text-[13px]"
                key={item}
                style={{ height: ROW_H }}
              >
                <Checkbox checked={checked[i] ?? false} />
                <span
                  className={cn(
                    "transition-colors",
                    checked[i]
                      ? "text-ui-fg-muted line-through"
                      : "text-ui-fg-base"
                  )}
                >
                  {item}
                </span>
              </div>
            ))}
          </div>

          <p className="mt-1 text-[13px] text-ui-fg-base leading-snug">
            <span className="text-ui-fg-muted">{NOTE_LEAD}</span>
            <span className="relative inline-block" ref={phraseRef}>
              <motion.span
                animate={{ scaleX: selecting ? 1 : 0 }}
                aria-hidden="true"
                className="absolute inset-x-0 inset-y-[-1px] origin-left rounded-[3px]"
                initial={{ scaleX: 0 }}
                style={{ backgroundColor: "rgba(139,92,246,0.18)" }}
                transition={{ duration: SWEEP_MS / 1000, ease: "easeOut" }}
              />
              <span
                className={cn(
                  "relative transition-all",
                  bold && "font-semibold",
                  italic && "italic"
                )}
              >
                {NOTE_PHRASE}
              </span>
              <AnimatePresence>
                {showToolbar ? (
                  <FormatToolbar bold={bold} italic={italic} />
                ) : null}
              </AnimatePresence>
            </span>
            <span className="text-ui-fg-base">{NOTE_TAIL}</span>
          </p>

          {!reduceMotion && (
            <PointerCursor dragging={dragging} x={pointerX} y={pointerY} />
          )}
        </div>
      </div>
    </div>
  );
}

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span
      className={cn(
        "flex size-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors",
        checked
          ? "border-transparent bg-blue-500 text-white"
          : "border-ui-border-base"
      )}
    >
      <AnimatePresence>
        {checked ? (
          <motion.span
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            initial={{ scale: 0 }}
            transition={POP}
          >
            <RiCheckLine className="size-3" />
          </motion.span>
        ) : null}
      </AnimatePresence>
    </span>
  );
}

// Floating formatting toolbar that pops above Marcus's text selection.
function FormatToolbar({ bold, italic }: { bold: boolean; italic: boolean }) {
  return (
    <motion.span
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="absolute -top-1 left-0 z-30 flex h-6 -translate-y-full items-center gap-0.5 rounded-md bg-card p-0.5 shadow-borders-base"
      exit={{ opacity: 0, y: 4, scale: 0.96 }}
      initial={{ opacity: 0, y: 4, scale: 0.96 }}
      transition={POP}
    >
      <FormatButton active={bold} className="font-bold" label="B" />
      <FormatButton active={italic} className="font-serif italic" label="I" />
      <FormatButton active={false} className="underline" label="U" />
    </motion.span>
  );
}

function FormatButton({
  active,
  className,
  label,
}: {
  active: boolean;
  className: string;
  label: string;
}) {
  return (
    <span
      className={cn(
        "flex size-5 items-center justify-center rounded text-[11px] leading-none transition-colors",
        className,
        active ? "bg-blue-500 text-white" : "text-ui-fg-muted"
      )}
    >
      {label}
    </span>
  );
}

// Sofia's text caret — a thin I-beam with a name flag, sits at the line end.
function TypingCaret({ color, name }: { color: string; name: string }) {
  return (
    <span
      className="relative ml-px inline-block h-3.5 w-0.5 translate-y-px rounded-full align-middle"
      style={{ backgroundColor: color }}
    >
      <span
        className="absolute top-1/2 left-1 -translate-y-1/2 whitespace-nowrap rounded-[4px] px-1 py-0.5 font-medium text-[9px] text-white leading-none"
        style={{ backgroundColor: color }}
      >
        {name}
      </span>
    </span>
  );
}

// Marcus's pointer — arrow + flag that glides to the active row or note line.
// While dragging, it rides the selection edge in sync with the highlight sweep.
function PointerCursor({
  x,
  y,
  dragging,
}: {
  x: number;
  y: number;
  dragging: boolean;
}) {
  return (
    <motion.div
      animate={{ x, y }}
      className="pointer-events-none absolute top-0 left-[7px] z-20 flex items-start gap-1"
      transition={
        dragging ? { duration: SWEEP_MS / 1000, ease: "easeOut" } : SPRING
      }
    >
      <svg
        aria-hidden="true"
        className="size-3.5 drop-shadow-sm"
        fill={MARCUS}
        viewBox="0 0 16 16"
      >
        <title>Marcus pointer</title>
        <path d="M1 1l5.5 13 2-5.5 5.5-2z" />
      </svg>
      <span
        className="rounded-[5px] rounded-tl-none px-1 py-0.5 font-medium text-[9px] text-white leading-none"
        style={{ backgroundColor: MARCUS }}
      >
        Marcus
      </span>
    </motion.div>
  );
}
