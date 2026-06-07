"use client";

import { AnimatedBeam } from "@omi/ui/animated-beam";
import { RiFileTextFill, RiStickyNoteFill } from "@remixicon/react";
import { motion, useReducedMotion } from "motion/react";
import { type Ref, useRef } from "react";
import { Eyebrow } from "~/components/marketing/eyebrow";
import { Section } from "~/components/marketing/section";

const EASE: [number, number, number, number] = [0.21, 0.47, 0.32, 0.98];

interface Res {
  domain?: string;
  title: string;
  type: "website" | "note" | "file";
}

const R1: Res = {
  title: "Building effective agents",
  type: "website",
  domain: "anthropic.com",
};
const R2: Res = {
  title: "System Design Primer",
  type: "website",
  domain: "github.com",
};
const R3: Res = {
  title: "Refactoring UI",
  type: "website",
  domain: "refactoringui.com",
};
const R4: Res = {
  title: "How Linear builds",
  type: "website",
  domain: "linear.app",
};
const R5: Res = {
  title: "Karpathy — Intro to LLMs",
  type: "website",
  domain: "youtube.com",
};
const R6: Res = {
  title: "The Rust Book",
  type: "website",
  domain: "doc.rust-lang.org",
};

export function SmartConnections() {
  return (
    <Section
      ariaLabel="Smart connections"
      className="border-border border-y bg-sidebar"
    >
      <div className="flex flex-col">
        <div className="flex flex-col">
          <Eyebrow>Connections</Eyebrow>
          <h2 className="mt-5 text-balance text-3xl text-display text-foreground">
            Auto-linked by meaning.
          </h2>
          <p className="mt-4 max-w-md font-medium text-sm text-ui-fg-muted">
            Omi connects related notes by shared concepts and similarity — no
            manual tagging. Your knowledge graph gets richer every time you save
            something.
          </p>
        </div>

        <ConnectionsGraph />
      </div>
    </Section>
  );
}

function ConnectionsGraph() {
  const reduceMotion = useReducedMotion();
  const repeat = reduceMotion ? 0 : Number.POSITIVE_INFINITY;

  const containerRef = useRef<HTMLDivElement>(null);
  const aiRef = useRef<HTMLDivElement>(null);
  const sweRef = useRef<HTMLDivElement>(null);
  const designRef = useRef<HTMLDivElement>(null);
  const r1Ref = useRef<HTMLDivElement>(null);
  const r2Ref = useRef<HTMLDivElement>(null);
  const r3Ref = useRef<HTMLDivElement>(null);
  const r4Ref = useRef<HTMLDivElement>(null);
  const r5Ref = useRef<HTMLDivElement>(null);
  const r6Ref = useRef<HTMLDivElement>(null);

  const beam = {
    containerRef,
    pathColor: "var(--border)",
    pathOpacity: 0.5,
    pathWidth: 1.5,
    gradientStartColor: "#60a5fa",
    gradientStopColor: "#3b82f6",
    duration: 4,
    repeat,
  };

  return (
    <div
      className="relative mx-auto mt-6 flex h-[340px] w-full max-w-2xl items-stretch justify-between"
      ref={containerRef}
    >
      {/* Left resources */}
      <div className="z-10 flex flex-col justify-around py-2">
        <ResourceNode
          delay={0}
          reduceMotion={reduceMotion}
          ref={r1Ref}
          res={R1}
        />
        <ResourceNode
          delay={0.1}
          reduceMotion={reduceMotion}
          ref={r2Ref}
          res={R2}
        />
        <ResourceNode
          delay={0.2}
          reduceMotion={reduceMotion}
          ref={r6Ref}
          res={R6}
        />
      </div>

      {/* Center concepts (the shared meaning) */}
      <div className="z-10 flex flex-col justify-center gap-14">
        <ConceptNode
          delay={0.05}
          label="#ai"
          reduceMotion={reduceMotion}
          ref={aiRef}
        />
        <ConceptNode
          delay={0.1}
          label="#software-engineering"
          reduceMotion={reduceMotion}
          ref={sweRef}
        />
        <ConceptNode
          delay={0.15}
          label="#design"
          reduceMotion={reduceMotion}
          ref={designRef}
        />
      </div>

      {/* Right resources */}
      <div className="z-10 flex flex-col justify-around py-2">
        <ResourceNode
          delay={0.05}
          reduceMotion={reduceMotion}
          ref={r3Ref}
          res={R3}
        />
        <ResourceNode
          delay={0.15}
          reduceMotion={reduceMotion}
          ref={r4Ref}
          res={R4}
        />
        <ResourceNode
          delay={0.25}
          reduceMotion={reduceMotion}
          ref={r5Ref}
          res={R5}
        />
      </div>

      {/* Beams — each resource flows into the concept(s) it shares */}
      <AnimatedBeam
        curvature={45}
        delay={0.2}
        fromRef={r1Ref}
        toRef={aiRef}
        {...beam}
      />
      <AnimatedBeam
        curvature={-10}
        delay={0.45}
        fromRef={r1Ref}
        toRef={sweRef}
        {...beam}
      />
      <AnimatedBeam
        curvature={25}
        delay={0.6}
        fromRef={r2Ref}
        toRef={sweRef}
        {...beam}
      />
      <AnimatedBeam
        curvature={-30}
        delay={0.75}
        fromRef={r6Ref}
        toRef={sweRef}
        {...beam}
      />
      <AnimatedBeam
        curvature={30}
        delay={0.3}
        fromRef={r3Ref}
        reverse
        toRef={designRef}
        {...beam}
      />
      <AnimatedBeam
        curvature={25}
        delay={0.5}
        fromRef={r4Ref}
        reverse
        toRef={designRef}
        {...beam}
      />
      <AnimatedBeam
        curvature={-20}
        delay={0.7}
        fromRef={r4Ref}
        reverse
        toRef={sweRef}
        {...beam}
      />
      <AnimatedBeam
        curvature={-45}
        delay={0.9}
        fromRef={r5Ref}
        reverse
        toRef={aiRef}
        {...beam}
      />
    </div>
  );
}

function ResourceNode({
  res,
  delay,
  reduceMotion,
  ref,
}: {
  res: Res;
  delay: number;
  reduceMotion: boolean | null;
  ref?: Ref<HTMLDivElement>;
}) {
  return (
    <motion.div
      className="flex w-fit items-center gap-2 rounded-lg bg-card px-2.5 py-1.5 shadow-borders-base"
      initial={
        reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }
      }
      ref={ref}
      transition={{ duration: 0.4, delay, ease: EASE }}
      viewport={{ once: true, margin: "-60px" }}
      whileInView={{ opacity: 1, scale: 1 }}
    >
      <ResourceTypeIcon resource={res} />
      <span className="max-w-[150px] truncate font-medium text-ui-fg-base text-xs">
        {res.title}
      </span>
    </motion.div>
  );
}

function ConceptNode({
  label,
  delay,
  reduceMotion,
  ref,
}: {
  label: string;
  delay: number;
  reduceMotion: boolean | null;
  ref?: Ref<HTMLDivElement>;
}) {
  return (
    <motion.div
      className="flex w-fit items-center rounded-full bg-blue-500 px-3 py-1.5 font-medium text-blue-100 text-xs shadow-borders-interactive-with-shadow"
      initial={
        reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }
      }
      ref={ref}
      transition={{ type: "spring", stiffness: 400, damping: 24, delay }}
      viewport={{ once: true, margin: "-60px" }}
      whileInView={{ opacity: 1, scale: 1 }}
    >
      {label}
    </motion.div>
  );
}

function ResourceTypeIcon({ resource }: { resource: Res }) {
  if (resource.type === "website" && resource.domain) {
    return (
      // biome-ignore lint/performance/noImgElement: external favicon, no next/image domain config
      <img
        alt=""
        className="size-3.5 shrink-0 rounded-[4px]"
        height={14}
        src={`https://www.google.com/s2/favicons?domain=${resource.domain}&sz=64`}
        width={14}
      />
    );
  }
  const Icon = resource.type === "note" ? RiStickyNoteFill : RiFileTextFill;
  return <Icon className="size-3.5 shrink-0 text-ui-fg-muted" />;
}
