"use client";

import { cn } from "@omi/ui";
import { Badge } from "@omi/ui/badge";
import { DotmSquare1 } from "@omi/ui/dotm-square-1";
import {
  RiCheckFill,
  RiFileTextFill,
  RiSendPlaneFill,
  RiStickyNoteFill,
  RiStopFill,
} from "@remixicon/react";
import BoringAvatar from "boring-avatars";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { FeatureSplit } from "~/components/marketing/feature-split";
import { GmailLogo, LinearLogo } from "~/components/marketing/mcp-logos";
import { Section } from "~/components/marketing/section";

const EASE: [number, number, number, number] = [0.21, 0.47, 0.32, 0.98];
const TYPE_MS = 38;
const THINK_MS = 1000;
const ANSWER_HOLD_MS = 4200;

interface Badged {
  domain?: string;
  title: string;
  type: "website" | "note" | "file";
}
type AnswerPart = { t: string } | { badge: Badged };
interface ToolResult {
  text: string;
  tool: "linear" | "gmail";
}
interface Conversation {
  answer: AnswerPart[];
  results?: ToolResult[];
  thinking: string[];
  user: string;
}

const CONVERSATIONS: Conversation[] = [
  {
    user: "Summarize my notes on rate limiting and open a ticket to document it",
    thinking: [
      "Searching library...",
      "Reading resource...",
      "Creating issue in Linear...",
    ],
    results: [
      {
        tool: "linear",
        text: 'Created OMI-241 · "Document rate-limit policy"',
      },
    ],
    answer: [
      {
        t: "You settled on a token bucket with exponential backoff on retries — see ",
      },
      {
        badge: {
          title: "Rate limiting strategies",
          type: "website",
          domain: "stripe.com",
        },
      },
      { t: " and " },
      { badge: { title: "Token bucket vs leaky bucket", type: "note" } },
      { t: ". I opened a Linear ticket to track documenting the policy." },
    ],
  },
  {
    user: "Find the Q3 roadmap and draft an email to Sarah with the highlights",
    thinking: ["Searching library...", "Drafting email in Gmail..."],
    results: [
      { tool: "gmail", text: 'Draft ready · "Q3 roadmap — highlights"' },
    ],
    answer: [
      { t: "Found it — " },
      { badge: { title: "Q3 roadmap", type: "website", domain: "linear.app" } },
      {
        t: ". I drafted an email to Sarah covering the three priorities and the launch date. Review and send when you're ready.",
      },
    ],
  },
  {
    user: "What did I learn about longevity supplements?",
    thinking: ["Searching library...", "Reading resource..."],
    answer: [
      { t: "The evidence is mixed. " },
      {
        badge: {
          title: "NMN — does it actually work?",
          type: "website",
          domain: "examine.com",
        },
      },
      { t: " notes limited human data, while " },
      { badge: { title: "Hallmarks of Aging.pdf", type: "file" } },
      {
        t: " frames the mechanisms they target. Net: promising in mice, unproven in humans.",
      },
    ],
  },
];

export function AiChatMcp() {
  return (
    <Section ariaLabel="AI chat and MCP">
      <FeatureSplit
        body="Chat answers are grounded in your library, with citations you can trust. Connect MCP servers — Linear, Gmail, Calendar — so your AI can take action, not just talk."
        eyebrow="AI + MCP"
        title="AI that acts on your knowledge."
        visual={<ChatMock />}
      />
    </Section>
  );
}

type Phase = "typing" | "thinking" | "answer";

function ChatMock() {
  const reduceMotion = useReducedMotion();
  const [cIndex, setCIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState<Phase>("typing");
  const [thinkStep, setThinkStep] = useState(0);

  const convo = CONVERSATIONS[cIndex % CONVERSATIONS.length];

  useEffect(() => {
    if (!convo || reduceMotion) {
      setPhase("answer");
      setTyped("");
      return;
    }
    let id: ReturnType<typeof setTimeout>;
    if (phase === "typing") {
      if (typed.length < convo.user.length) {
        id = setTimeout(
          () => setTyped(convo.user.slice(0, typed.length + 1)),
          TYPE_MS
        );
      } else {
        id = setTimeout(() => {
          setTyped("");
          setThinkStep(0);
          setPhase("thinking");
        }, 450);
      }
    } else if (phase === "thinking") {
      if (thinkStep < convo.thinking.length) {
        id = setTimeout(() => setThinkStep((s) => s + 1), THINK_MS);
      } else {
        id = setTimeout(() => setPhase("answer"), 220);
      }
    } else {
      id = setTimeout(() => {
        setThinkStep(0);
        setPhase("typing");
        setCIndex((i) => (i + 1) % CONVERSATIONS.length);
      }, ANSWER_HOLD_MS);
    }
    return () => clearTimeout(id);
  }, [phase, typed, thinkStep, convo, reduceMotion]);

  if (!convo) {
    return null;
  }

  const thinkingLabel =
    convo.thinking[Math.min(thinkStep, convo.thinking.length - 1)] ??
    "Thinking...";

  return (
    <div className="flex w-full flex-col rounded-lg bg-ui-bg-base p-2 shadow-borders-base">
      <div className="flex min-h-[240px] flex-col justify-start gap-4">
        {phase === "typing" ? null : (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
            key={`u-${cIndex}`}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <UserBubble text={convo.user} />
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {phase === "thinking" ? (
            <motion.div
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              key="thinking"
              transition={{ duration: 0.2 }}
            >
              <ThinkingRow label={thinkingLabel} />
            </motion.div>
          ) : null}
          {phase === "answer" ? (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
              key={`a-${cIndex}`}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <AssistantBubble
                convo={convo}
                reduceMotion={Boolean(reduceMotion)}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <ChatInputMock streaming={phase === "thinking"} value={typed} />
    </div>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="group flex min-w-0 flex-row-reverse gap-2">
      <span className="relative top-2 size-7 shrink-0 overflow-hidden rounded-full">
        <BoringAvatar name="you" size={28} variant="marble" />
      </span>
      <div className="flex min-w-0 max-w-[80%] flex-col items-end">
        <div className="min-w-0 max-w-full rounded-lg bg-ui-bg-component-hover px-3 py-2 text-sm">
          <div className="whitespace-pre-wrap break-words text-ui-fg-base leading-relaxed">
            {text}
          </div>
        </div>
      </div>
    </div>
  );
}

function AssistantBubble({
  convo,
  reduceMotion,
}: {
  convo: Conversation;
  reduceMotion: boolean;
}) {
  return (
    <div className="group -ml-2 flex min-w-0 gap-0">
      <OmiAvatar />
      <div className="flex min-w-0 max-w-[85%] flex-col items-start gap-2">
        <div className="min-w-0 max-w-full rounded-lg bg-transparent px-3 py-2 text-sm">
          <span className="break-words text-ui-fg-base leading-relaxed">
            {convo.answer.map((part, i) =>
              "badge" in part ? (
                <ChatResourceBadge
                  b={part.badge}
                  key={`b-${i}-${part.badge.title}`}
                />
              ) : (
                <span key={`t-${i}-${part.t.slice(0, 8)}`}>{part.t}</span>
              )
            )}
          </span>
        </div>
        {convo.results?.map((r, i) => (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
            key={r.text}
            transition={{ delay: 0.25 + i * 0.1, duration: 0.3, ease: EASE }}
          >
            <ToolResultChip result={r} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function OmiAvatar() {
  return (
    <div className="relative top-0 left-2 flex size-10 shrink-0 items-center justify-center">
      {/* biome-ignore lint/performance/noImgElement: local brand mark, fixed size */}
      <img
        alt="Omi"
        className="size-8 rounded-lg"
        height={64}
        src="/omi_black_on_transparent.png"
        width={64}
      />
    </div>
  );
}

function ThinkingRow({ label }: { label: string }) {
  return (
    <div className="ml-4 flex items-center gap-2">
      <DotmSquare1 dotSize={2} size={16} speed={1} />
      <TextShimmer className="ml-2 text-[13px]">{label}</TextShimmer>
    </div>
  );
}

function ToolResultChip({ result }: { result: ToolResult }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-ui-bg-component px-2.5 py-1.5 font-medium text-[12px] text-ui-fg-base shadow-borders-base">
      <RiCheckFill className="size-3.5 shrink-0 text-emerald-600" />
      {result.tool === "linear" ? (
        <LinearLogo className="size-3.5 shrink-0 text-foreground" />
      ) : (
        <GmailLogo className="size-3.5 shrink-0 text-foreground" />
      )}
      <span className="truncate">{result.text}</span>
    </span>
  );
}

function ChatResourceBadge({ b }: { b: Badged }) {
  return (
    <span className="inline-flex max-w-full -translate-y-[2px] align-middle">
      <Badge className="max-w-full" variant="mono">
        <BadgeIcon b={b} />
        <span className="min-w-0 truncate font-medium font-sans! text-xs">
          {b.title}
        </span>
      </Badge>
    </span>
  );
}

function BadgeIcon({ b }: { b: Badged }) {
  if (b.type === "website") {
    return b.domain ? (
      // biome-ignore lint/performance/noImgElement: external favicon, no next/image domain config
      <img
        alt=""
        className="size-3.5 shrink-0 rounded-[3px] object-cover"
        height={14}
        src={`https://www.google.com/s2/favicons?domain=${b.domain}&sz=64`}
        width={14}
      />
    ) : null;
  }
  const Icon = b.type === "note" ? RiStickyNoteFill : RiFileTextFill;
  return <Icon className="size-3.5 shrink-0 text-muted-foreground" />;
}

function ChatInputMock({
  value,
  streaming,
}: {
  value: string;
  streaming: boolean;
}) {
  return (
    <div className="relative mt-4 w-full rounded-md bg-ui-bg-field-component-hover shadow-borders-base">
      <div className="min-h-[64px] w-full whitespace-pre-wrap py-2 pr-10 pl-3 text-sm text-ui-fg-base">
        {value ? (
          <>
            {value}
            <span className="ml-px inline-block h-3.5 w-px translate-y-px animate-blink bg-ui-fg-base align-middle" />
          </>
        ) : (
          <span className="text-ui-fg-muted">
            Ask about your library… (use @ to reference a resource)
          </span>
        )}
      </div>
      <span className="absolute right-2 bottom-1.5 flex size-7 items-center justify-center rounded-full bg-linear-to-t from-blue-500 to-blue-400 text-white">
        {streaming ? (
          <RiStopFill className="size-4 shrink-0" />
        ) : (
          <RiSendPlaneFill className="size-4 shrink-0" />
        )}
      </span>
    </div>
  );
}

// Recreated from apps/app .../common/text-shimmer.tsx
function TextShimmer({
  children,
  className,
  duration = 1.5,
  spread = 3,
}: {
  children: string;
  className?: string;
  duration?: number;
  spread?: number;
}) {
  const dynamicSpread = useMemo(
    () => children.length * spread,
    [children, spread]
  );

  return (
    <>
      <style>{`
        @keyframes text-shimmer {
          0% { background-position: 100% center; }
          100% { background-position: 0% center; }
        }
      `}</style>
      <span
        className={cn(
          "relative bg-[size:250%_100%,auto] bg-clip-text text-transparent",
          "[--bg:linear-gradient(90deg,#0000_calc(50%-var(--spread)),var(--fg-base),#0000_calc(50%+var(--spread)))] [background-repeat:no-repeat,padding-box]",
          className
        )}
        style={
          {
            "--spread": `${dynamicSpread}px`,
            backgroundImage:
              "var(--bg), linear-gradient(var(--fg-disabled), var(--fg-disabled))",
            animation: `text-shimmer ${duration}s linear infinite`,
          } as React.CSSProperties
        }
      >
        {children}
      </span>
    </>
  );
}
