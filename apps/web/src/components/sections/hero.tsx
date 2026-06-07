"use client";

import { cn } from "@omi/ui";
import { Button } from "@omi/ui/button";
import { Tabs, TabsList, TabsTab } from "@omi/ui/tabs";
import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import { type HeroPersona, heroPersonas } from "~/lib/hero-personas";
import { links } from "~/lib/site";

const EASE: [number, number, number, number] = [0.21, 0.47, 0.32, 0.98];

export function Hero() {
  const reduceMotion = useReducedMotion();
  const [personaId, setPersonaId] = useState(heroPersonas[0]?.id ?? "");
  const persona = heroPersonas.find((p) => p.id === personaId);

  if (!persona) {
    return null;
  }

  return (
    <section
      className="relative overflow-hidden px-5 pt-16 pb-16 sm:px-8 sm:pt-24 sm:pb-24"
      id="top"
    >
      <div className="relative mx-auto flex w-full max-w-xl flex-col items-start text-left">
        <motion.h1
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-balance text-4xl text-display text-foreground"
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.55, delay: 0.05, ease: EASE }}
        >
          The knowledge base that thinks with you.
        </motion.h1>
        <motion.p
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 max-w-xl text-balance font-medium text-sm text-ui-fg-muted"
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.55, delay: 0.12, ease: EASE }}
        >
          Capture anything. Find it by meaning. Let your AI act on it with
          semantic search, smart connections, and MCP-powered chat.
        </motion.p>
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center"
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.55, delay: 0.19, ease: EASE }}
        >
          <Button
            className="rounded-full"
            render={<a href={links.register}>Try for free</a>}
            size="base"
            variant="default"
          />
        </motion.div>
      </div>

      {/* Tabs centered on the page */}
      <div className="mx-auto mt-32 w-full max-w-xl">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.5, delay: 0.2, ease: EASE }}
        >
          <PersonaTabs onValueChange={setPersonaId} value={personaId} />
        </motion.div>
      </div>

      <div className="mx-auto w-full max-w-4xl">
        <HeroFrame persona={persona} reduceMotion={Boolean(reduceMotion)} />
      </div>
    </section>
  );
}

function PersonaTabs({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
}) {
  return (
    <Tabs onValueChange={(v) => onValueChange(v as string)} value={value}>
      <TabsList className="rounded-full border border-border bg-accent/60 p-0.5 [&_[data-slot=tab-indicator]]:rounded-full [&_[data-slot=tab-indicator]]:bg-card [&_[data-slot=tab-indicator]]:shadow-soft-sm">
        {heroPersonas.map((p) => (
          <TabsTab
            className="h-7 gap-1.5 rounded-full px-2.5 text-xs sm:h-7 sm:text-xs"
            key={p.id}
            value={p.id}
          >
            <span
              className={cn(
                "flex size-4 items-center justify-center rounded",
                p.tint
              )}
            >
              <p.Icon className="size-3" />
            </span>
            <span className="hidden sm:inline">{p.label}</span>
          </TabsTab>
        ))}
      </TabsList>
    </Tabs>
  );
}

function HeroFrame({
  persona,
  reduceMotion,
}: {
  persona: HeroPersona;
  reduceMotion: boolean;
}) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="relative mt-5 w-full"
      initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 32 }}
      transition={{ duration: 0.7, delay: 0.28, ease: EASE }}
    >
      <div className="relative overflow-hidden rounded-2xl p-6 shadow-soft-lg sm:p-12">
        <Image
          alt=""
          aria-hidden="true"
          className="-z-10 object-cover"
          fill
          priority
          sizes="(max-width: 896px) 100vw, 896px"
          src="/hero-background.jpeg"
        />
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          initial={
            reduceMotion
              ? { opacity: 1, scale: 1 }
              : { opacity: 0, scale: 0.99 }
          }
          key={persona.id}
          transition={{ duration: 0.35, ease: EASE }}
        >
          {persona.image ? (
            <Image
              alt={`Omi — ${persona.label} workspace`}
              className="w-full rounded-lg shadow-lg ring-1 ring-black/10"
              height={1800}
              priority
              sizes="(max-width: 896px) 100vw, 896px"
              src={persona.image}
              width={2880}
            />
          ) : (
            <div className="flex aspect-[16/10] w-full items-center justify-center rounded-xl bg-card/95 ring-1 ring-black/10">
              <span className="font-mono text-muted-foreground text-xs">
                {persona.label} preview coming soon
              </span>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
