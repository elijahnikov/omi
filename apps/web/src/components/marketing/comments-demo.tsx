"use client";

import { cn } from "@omi/ui";
import { RiSendPlaneFill } from "@remixicon/react";
import BoringAvatar from "boring-avatars";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

const SPRING = { type: "spring", stiffness: 420, damping: 30 } as const;
const TYPE_MS = 38;
const PICKER_MS = 1100;
const INSERT_MS = 850;
const REPLY_MS = 1100;
const HOLD_MS = 2400;

const PRE = "yes please 🙌 cc ";
const MENTION = "@Sofia";

const MEMBERS = [
  { name: "Sofia", handle: "@sofia" },
  { name: "Priya", handle: "@priya" },
  { name: "Marcus", handle: "@marcus" },
];

type Part = { t: string } | { mention: string };

interface Comment {
  author: string;
  id: string;
  parts: Part[];
  time: string;
}

const SEED: Comment = {
  id: "seed",
  author: "Liam",
  time: "3h ago",
  parts: [{ t: "Found a beach villa in Tulum 🏖️ 4 beds, pool, $1.2k/week" }],
};
const YOU: Comment = {
  id: "you",
  author: "You",
  time: "now",
  parts: [{ t: PRE }, { mention: MENTION }],
};
const REPLY: Comment = {
  id: "reply",
  author: "Sofia",
  time: "now",
  parts: [{ t: "I'm in! ✈️ booking flights now" }],
};

export function CommentsDemo() {
  const reduceMotion = useReducedMotion();
  const [typed, setTyped] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [inserted, setInserted] = useState(false);
  const [sent, setSent] = useState(false);
  const [replied, setReplied] = useState(false);

  useEffect(() => {
    if (reduceMotion) {
      setSent(true);
      setReplied(true);
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
      setTyped("");
      setShowPicker(false);
      setInserted(false);
      setSent(false);
      setReplied(false);
    };

    const typeChar = (n: number) => {
      if (cancelled) {
        return;
      }
      if (n <= PRE.length) {
        setTyped(PRE.slice(0, n));
        push(() => typeChar(n + 1), TYPE_MS);
        return;
      }
      // PRE done → the "@" triggers the mention picker
      setTyped(`${PRE}@`);
      setShowPicker(true);
      push(() => {
        setShowPicker(false);
        setInserted(true);
        setTyped(PRE);
        push(() => {
          setSent(true);
          setTyped("");
          setInserted(false);
          push(() => setReplied(true), REPLY_MS);
          push(() => {
            reset();
            typeChar(0);
          }, REPLY_MS + HOLD_MS);
        }, INSERT_MS);
      }, PICKER_MS);
    };

    typeChar(0);
    return () => {
      cancelled = true;
      for (const t of timers) {
        clearTimeout(t);
      }
    };
  }, [reduceMotion]);

  const thread: Comment[] = [
    SEED,
    ...(sent ? [YOU] : []),
    ...(replied ? [REPLY] : []),
  ];
  const showCursor = !(reduceMotion || sent);

  return (
    <div className="relative -mr-4 h-full overflow-hidden">
      {/* Shifted right + wider than the box, so it runs off the right edge */}
      <div className="flex h-full w-[118%] flex-col pb-1.5 pl-3 [mask-image:linear-gradient(to_right,black_82%,transparent)]">
        {/* Thread */}
        <div className="relative flex-1 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_14%)]">
          <div className="flex flex-col gap-3 pt-3">
            <AnimatePresence initial={false}>
              {thread.map((c) => (
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  initial={
                    reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }
                  }
                  key={c.id}
                  layout
                  transition={SPRING}
                >
                  <CommentItem comment={c} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Composer */}
        <div className="relative mt-2">
          <AnimatePresence>
            {showPicker ? (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-[calc(100%+6px)] left-0 z-10 w-full rounded-lg bg-ui-bg-component not-dark:bg-clip-padding p-1 text-ui-fg-base shadow-elevation-flyout"
                exit={{ opacity: 0, y: 4 }}
                initial={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.18 }}
              >
                {MEMBERS.map((m, i) => (
                  <div
                    className={cn(
                      "flex items-center gap-x-2 rounded-lg px-2 py-1.5 text-ui-fg-subtle",
                      i === 0 && "bg-ui-bg-component-hover text-ui-fg-base"
                    )}
                    key={m.name}
                  >
                    <Avatar name={m.name} />
                    <span className="flex-1 truncate text-sm">{m.name}</span>
                    <span className="text-[11px] text-ui-fg-muted">
                      {m.handle}
                    </span>
                  </div>
                ))}
              </motion.div>
            ) : null}
          </AnimatePresence>

          <div className="relative w-full rounded-lg bg-ui-bg-field-component-hover text-ui-fg-base shadow-borders-base transition-fg">
            <div className="flex h-8 items-center px-3 pr-9 text-sm text-ui-fg-base">
              {typed || inserted ? (
                <>
                  <span>{typed}</span>
                  {inserted ? <MentionChip>{MENTION}</MentionChip> : null}
                  {showCursor ? (
                    <span className="ml-px inline-block h-3.5 w-px translate-y-px animate-blink bg-ui-fg-base align-middle" />
                  ) : null}
                </>
              ) : (
                <span className="text-ui-fg-muted">Write a comment…</span>
              )}
            </div>
            <span className="absolute top-1/2 right-1.5 flex size-6 -translate-y-1/2 items-center justify-center rounded-full bg-linear-to-t from-blue-500 to-blue-400 text-white">
              <RiSendPlaneFill className="size-3.5 shrink-0" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CommentItem({ comment }: { comment: Comment }) {
  return (
    <div className="flex gap-2">
      <span className="mt-0.5">
        <Avatar name={comment.author} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2">
          <span className="font-medium text-ui-fg-base text-xs">
            {comment.author}
          </span>
          <span className="text-[11px] text-ui-fg-muted">{comment.time}</span>
        </div>
        <p className="text-[13px] text-ui-fg-base leading-snug">
          {comment.parts.map((part, i) =>
            "mention" in part ? (
              <MentionChip key={`m-${i}-${part.mention}`}>
                {part.mention}
              </MentionChip>
            ) : (
              <span key={`t-${i}-${part.t.slice(0, 6)}`}>{part.t}</span>
            )
          )}
        </p>
      </div>
    </div>
  );
}

function MentionChip({ children }: { children: string }) {
  return (
    <span className="rounded-[4px] bg-blue-50 px-1 py-0.5 font-medium text-blue-700">
      {children}
    </span>
  );
}

function Avatar({ name }: { name: string }) {
  return (
    <span className="block size-5 shrink-0 overflow-hidden rounded-full">
      <BoringAvatar name={name} size={20} variant="marble" />
    </span>
  );
}
