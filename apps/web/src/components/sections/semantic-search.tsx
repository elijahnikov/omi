"use client";

import { Input } from "@omi/ui/input";
import { RiFileTextFill, RiStickyNoteFill } from "@remixicon/react";
import BoringAvatar from "boring-avatars";
import { Globe } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { FeatureSplit } from "~/components/marketing/feature-split";
import { Section } from "~/components/marketing/section";

const EASE: [number, number, number, number] = [0.21, 0.47, 0.32, 0.98];

interface SnippetPart {
  mark?: boolean;
  t: string;
}
interface SearchResult {
  avatar?: string;
  domain?: string;
  snippet?: SnippetPart[];
  title: string;
  type: "website" | "note" | "file";
}
interface ExampleSearch {
  query: string;
  results: SearchResult[];
}

const SEARCHES: ExampleSearch[] = [
  {
    query: "how did we handle auth retries",
    results: [
      {
        type: "website",
        title: "Rate limiting strategies for our API",
        domain: "stripe.com",
        snippet: [
          { t: "…use exponential backoff on " },
          { t: "retries", mark: true },
          { t: " so we don't hammer the gateway…" },
        ],
      },
      {
        type: "note",
        title: "Token bucket vs leaky bucket",
        avatar: "Dev Kumar",
        snippet: [
          { t: "…the gateway throttles " },
          { t: "auth", mark: true },
          { t: " requests once the bucket drains…" },
        ],
      },
      {
        type: "website",
        title: "Thread: scaling the gateway",
        domain: "github.com",
      },
      {
        type: "file",
        title: "Gateway incident runbook.pdf",
        snippet: [
          { t: "…when 429s spike, drain the queue and raise the " },
          { t: "retry", mark: true },
          { t: " budget…" },
        ],
      },
      {
        type: "website",
        title: "Exponential backoff and jitter",
        domain: "aws.amazon.com",
      },
    ],
  },
  {
    query: "best ramen in tokyo",
    results: [
      {
        type: "website",
        title: "Best ramen in Shinjuku",
        domain: "tabelog.com",
        snippet: [
          { t: "…the richest tonkotsu " },
          { t: "ramen", mark: true },
          { t: " in " },
          { t: "Tokyo", mark: true },
          { t: ", worth the queue…" },
        ],
      },
      {
        type: "note",
        title: "14-day Japan itinerary",
        snippet: [
          { t: "…day 3 — a " },
          { t: "ramen", mark: true },
          { t: " crawl through Shibuya…" },
        ],
      },
      {
        type: "website",
        title: "Tokyo neighbourhood guide",
        domain: "timeout.com",
      },
      {
        type: "website",
        title: "Ichiran vs Ippudo — which is better?",
        domain: "reddit.com",
        snippet: [
          { t: "…honestly the best " },
          { t: "ramen", mark: true },
          { t: " near the station is neither…" },
        ],
      },
      { type: "note", title: "Tokyo food bucket list", avatar: "Alex Lee" },
    ],
  },
  {
    query: "what did i save about longevity",
    results: [
      {
        type: "file",
        title: "Hallmarks of Aging.pdf",
        snippet: [
          { t: "…nine " },
          { t: "hallmarks", mark: true },
          { t: " that drive biological " },
          { t: "ageing", mark: true },
          { t: "…" },
        ],
      },
      {
        type: "website",
        title: "Rapamycin & longevity — a review",
        domain: "nature.com",
      },
      {
        type: "website",
        title: "NMN — does it actually work?",
        domain: "examine.com",
        snippet: [
          { t: "…limited human evidence for " },
          { t: "longevity", mark: true },
          { t: " benefits so far…" },
        ],
      },
      {
        type: "website",
        title: "Peter Attia — what moves the needle",
        domain: "youtube.com",
      },
      { type: "note", title: "Lit review draft", avatar: "Priya Rao" },
    ],
  },
  {
    query: "onboarding flow inspiration",
    results: [
      {
        type: "website",
        title: "Onboarding patterns",
        domain: "mobbin.com",
        snippet: [
          { t: "…progressive " },
          { t: "onboarding", mark: true },
          { t: " that defers signup until value is shown…" },
        ],
      },
      { type: "website", title: "Figma — onboarding v4", domain: "figma.com" },
      {
        type: "website",
        title: "Refactoring UI",
        domain: "refactoringui.com",
      },
      {
        type: "note",
        title: "Onboarding teardown — Linear",
        avatar: "Maya Chen",
        snippet: [
          { t: "…they nail the empty state in step 2 of " },
          { t: "onboarding", mark: true },
          { t: "…" },
        ],
      },
      { type: "website", title: "Dashboard shots", domain: "dribbble.com" },
    ],
  },
  {
    query: "ser vs estar",
    results: [
      {
        type: "website",
        title: "SpanishDict — ser vs estar",
        domain: "spanishdict.com",
        snippet: [
          { t: "…use " },
          { t: "estar", mark: true },
          { t: " for temporary states and location…" },
        ],
      },
      { type: "note", title: "Grammar notes — the subjunctive" },
      {
        type: "website",
        title: "Language Transfer — complete course",
        domain: "languagetransfer.org",
      },
      {
        type: "website",
        title: "Dreaming Spanish — comprehensible input",
        domain: "youtube.com",
      },
      { type: "file", title: "Verb conjugation cheatsheet.pdf" },
    ],
  },
  {
    query: "negotiation tactics i saved",
    results: [
      {
        type: "website",
        title: "Never Split the Difference — summary",
        domain: "grahammann.net",
        snippet: [
          { t: "…tactical empathy is the core of every " },
          { t: "negotiation", mark: true },
          { t: "…" },
        ],
      },
      {
        type: "note",
        title: "Tactics — mirroring & labeling",
        avatar: "Alex Lee",
        snippet: [
          { t: "…label the emotion, then go quiet during the " },
          { t: "negotiation", mark: true },
          { t: "…" },
        ],
      },
      {
        type: "website",
        title: "How to do great work",
        domain: "paulgraham.com",
      },
      {
        type: "website",
        title: "The psychology of money",
        domain: "collabfund.com",
      },
      { type: "file", title: "Negotiation cheatsheet.pdf" },
    ],
  },
];

const TYPE_MS = 38;
const REVEAL_MS = 350;
const HOLD_MS = 2800;

export function SemanticSearch() {
  return (
    <Section ariaLabel="Semantic search" id="features">
      <FeatureSplit
        body="Omi ranks results by what they mean, combining titles, vector similarity, content chunks, AI-extracted concepts, and your own usage. Find the right thing even when you can't remember the words."
        eyebrow="Search"
        title="Search by meaning. Not keywords."
        visual={<SearchMock />}
      />
    </Section>
  );
}

function SearchMock() {
  const reduceMotion = useReducedMotion();
  const [qIndex, setQIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [showResults, setShowResults] = useState(false);

  const current = SEARCHES[qIndex % SEARCHES.length];
  const fullQuery = current?.query ?? "";
  const results = current?.results ?? [];

  useEffect(() => {
    if (reduceMotion) {
      setTyped(fullQuery);
      setShowResults(true);
      return;
    }
    let id: ReturnType<typeof setTimeout>;
    if (typed.length < fullQuery.length) {
      id = setTimeout(
        () => setTyped(fullQuery.slice(0, typed.length + 1)),
        TYPE_MS
      );
    } else if (showResults) {
      id = setTimeout(() => {
        setShowResults(false);
        setTyped("");
        setQIndex((i) => (i + 1) % SEARCHES.length);
      }, HOLD_MS);
    } else {
      id = setTimeout(() => setShowResults(true), REVEAL_MS);
    }
    return () => clearTimeout(id);
  }, [typed, showResults, fullQuery, reduceMotion]);

  return (
    <div className="w-full rounded-lg bg-ui-bg-base p-2 shadow-borders-base">
      <Input
        aria-label="Search your library"
        placeholder="Search your library…"
        readOnly
        type="search"
        value={typed}
      />

      <div className="mt-3 min-h-[270px]">
        <AnimatePresence mode="wait">
          {showResults ? (
            <motion.div
              animate={{ opacity: 1 }}
              className="space-y-0.5"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              key={qIndex}
              transition={{ duration: 0.2 }}
            >
              {results.map((r, i) => (
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  initial={
                    reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }
                  }
                  key={r.title}
                  transition={{
                    delay: reduceMotion ? 0 : i * 0.09,
                    duration: 0.35,
                    ease: EASE,
                  }}
                >
                  <ResultRow result={r} />
                </motion.div>
              ))}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Recreated 1:1 from apps/app .../library-page/resource-row.tsx
function ResultRow({ result }: { result: SearchResult }) {
  return (
    <div className="group relative flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-ui-bg-component-hover">
      <ResultIcon result={result} />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-medium text-sm text-ui-fg-base">
          {result.title}
        </span>
        {result.snippet ? <SnippetLine parts={result.snippet} /> : null}
      </div>
      {result.avatar ? (
        <span className="size-5 shrink-0 overflow-hidden rounded-full">
          <BoringAvatar name={result.avatar} size={20} variant="marble" />
        </span>
      ) : null}
    </div>
  );
}

function ResultIcon({ result }: { result: SearchResult }) {
  if (result.type === "website") {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md">
        {result.domain ? (
          // biome-ignore lint/performance/noImgElement: external favicon, no next/image domain config
          <img
            alt=""
            className="size-6 shrink-0 rounded-sm"
            height={24}
            src={`https://www.google.com/s2/favicons?domain=${result.domain}&sz=64`}
            width={24}
          />
        ) : (
          <Globe className="size-4 text-ui-fg-muted" />
        )}
      </div>
    );
  }
  const Icon = result.type === "note" ? RiStickyNoteFill : RiFileTextFill;
  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-ui-bg-subtle text-ui-fg-muted">
      <Icon className="size-4" />
    </div>
  );
}

function SnippetLine({ parts }: { parts: SnippetPart[] }) {
  return (
    <div className="mt-0.5 line-clamp-2 text-ui-fg-subtle text-xs leading-relaxed">
      {parts.map((p, i) =>
        p.mark ? (
          <mark
            className="rounded-sm bg-ui-tag-orange-bg px-0.5 text-ui-tag-orange-text"
            key={`${i}-${p.t}`}
          >
            {p.t}
          </mark>
        ) : (
          <span key={`${i}-${p.t}`}>{p.t}</span>
        )
      )}
    </div>
  );
}
