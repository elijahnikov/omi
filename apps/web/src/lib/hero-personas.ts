import {
  RiBookmarkFill,
  RiBookOpenFill,
  RiBriefcaseFill,
  RiFlaskFill,
  RiPaletteFill,
  RiPlaneFill,
} from "@remixicon/react";
import type { ComponentType } from "react";

export interface HeroPersona {
  Icon: ComponentType<{ className?: string }>;
  id: string;
  /** Real app screenshot (16:10). Falls back to a placeholder when absent. */
  image?: string;
  label: string;
  /** Drives the mock search panel for this workspace. */
  query: string;
  results: { title: string; score: number }[];
  /** Colourful tint classes for the tab icon chip. */
  tint: string;
}

export const heroPersonas: HeroPersona[] = [
  {
    id: "research",
    label: "Research",
    Icon: RiFlaskFill,
    image: "/hero/research.png",
    tint: "bg-violet-500/15 text-violet-600",
    query: "senolytics evidence",
    results: [
      { title: "Hallmarks of Aging (updated).pdf", score: 94 },
      { title: "Rapamycin & longevity — review", score: 88 },
      { title: "Examine — NMN evidence", score: 79 },
    ],
  },
  {
    id: "work",
    label: "Work",
    Icon: RiBriefcaseFill,
    image: "/hero/work.png",
    tint: "bg-blue-500/15 text-blue-600",
    query: "this week's standups",
    results: [
      { title: "Q3 roadmap — Linear", score: 93 },
      { title: "PR #482 — streaming chat", score: 86 },
      { title: "1:1 notes — Sarah", score: 80 },
    ],
  },
  {
    id: "travel",
    label: "Travel",
    Icon: RiPlaneFill,
    image: "/hero/travel.png",
    tint: "bg-amber-500/15 text-amber-600",
    query: "best ryokan near Kyoto",
    results: [
      { title: "14-day Japan itinerary", score: 91 },
      { title: "Kyoto machiya — Airbnb", score: 85 },
      { title: "JR Pass — is it worth it?", score: 78 },
    ],
  },
  {
    id: "bookmarking",
    label: "Bookmarking",
    Icon: RiBookmarkFill,
    image: "/hero/bookmarking.png",
    tint: "bg-rose-500/15 text-rose-600",
    query: "negotiation tactics",
    results: [
      { title: "Never Split the Difference — notes", score: 90 },
      { title: "How to do great work", score: 84 },
      { title: "The psychology of money", score: 77 },
    ],
  },
  {
    id: "design",
    label: "Design",
    Icon: RiPaletteFill,
    image: "/hero/design.png",
    tint: "bg-fuchsia-500/15 text-fuchsia-600",
    query: "onboarding flows",
    results: [
      { title: "Mobbin — onboarding patterns", score: 92 },
      { title: "Dribbble — dashboard shots", score: 85 },
      { title: "Refactoring UI", score: 80 },
    ],
  },
  {
    id: "learning",
    label: "Learning",
    Icon: RiBookOpenFill,
    image: "/hero/learning.png",
    tint: "bg-emerald-500/15 text-emerald-600",
    query: "rust lifetimes",
    results: [
      { title: "The Rust Programming Language", score: 93 },
      { title: "Ownership & borrowing notes", score: 86 },
      { title: "rustlings — exercises", score: 79 },
    ],
  },
];
