"use client";

import { Check, Quote, Wrench } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { FeatureSplit } from "~/components/marketing/feature-split";
import { Section } from "~/components/marketing/section";

const EASE: [number, number, number, number] = [0.21, 0.47, 0.32, 0.98];

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

const steps = [
  { kind: "user", text: "Summarize my research on rate limiting and file it." },
  { kind: "assistant", text: "Here's a summary across 4 saved sources." },
  { kind: "cite", text: "token-bucket.md · gateway-thread · API docs" },
  { kind: "tool", text: "Calling Linear MCP — create issue" },
  { kind: "done", text: "Created OMI-218 “Document rate-limit policy”" },
];

function ChatMock() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft-lg">
      <div className="flex items-center justify-between border-border border-b px-4 py-3">
        <span className="font-mono text-foreground text-sm">omi · chat</span>
        <span className="font-mono text-muted-foreground text-xs">
          mcp: linear · gmail · calendar
        </span>
      </div>
      <div className="space-y-3 p-5">
        {steps.map((step, i) => (
          <motion.div
            initial={
              reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }
            }
            key={step.text}
            transition={{ duration: 0.4, delay: i * 0.18, ease: EASE }}
            viewport={{ once: true, margin: "-60px" }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <ChatRow kind={step.kind} text={step.text} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ChatRow({ kind, text }: { kind: string; text: string }) {
  if (kind === "user") {
    return (
      <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-blue-500 px-3.5 py-2 text-sm text-white">
        {text}
      </div>
    );
  }
  if (kind === "assistant") {
    return (
      <div className="w-fit max-w-[85%] rounded-2xl rounded-bl-sm bg-accent px-3.5 py-2 text-foreground text-sm">
        {text}
      </div>
    );
  }
  if (kind === "cite") {
    return (
      <div className="flex items-center gap-2 pl-1 font-mono text-muted-foreground text-xs">
        <Quote size={12} />
        {text}
      </div>
    );
  }
  if (kind === "tool") {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-border border-dashed bg-background px-3 py-2 font-mono text-muted-foreground text-xs">
        <Wrench className="text-blue-500" size={13} />
        {text}
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-foreground text-xs">
      <Check className="text-emerald-500" size={14} />
      {text}
    </div>
  );
}
