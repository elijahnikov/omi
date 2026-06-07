import { cn } from "@omi/ui";
import { Text } from "@omi/ui/text";
import {
  CalendarDays,
  FolderTree,
  Import,
  MessagesSquare,
  Sparkles,
  Users,
} from "lucide-react";
import type { ComponentType } from "react";
import { CollectionsDemo } from "~/components/marketing/collections-demo";
import { CommentsDemo } from "~/components/marketing/comments-demo";
import { EditorDemo } from "~/components/marketing/editor-demo";
import { EnrichmentDemo } from "~/components/marketing/enrichment-demo";
import { Eyebrow } from "~/components/marketing/eyebrow";
import { ImportSyncDemo } from "~/components/marketing/import-sync-demo";
import { JournalDemo } from "~/components/marketing/journal-demo";
import { Section } from "~/components/marketing/section";
import { Stagger, StaggerItem } from "~/components/motion/stagger";
import { bentoFeatures } from "~/lib/features";

const icons = [
  MessagesSquare,
  CalendarDays,
  Sparkles,
  Users,
  FolderTree,
  Import,
];

// Animated UI per box (others still blank for now).
const visuals: (ComponentType | undefined)[] = [
  CommentsDemo,
  JournalDemo,
  EnrichmentDemo,
  EditorDemo,
  CollectionsDemo,
  ImportSyncDemo,
];

// Bento spans (lg) — sums to 9 across a 3-col grid for an alternating layout.
const spans = [
  "lg:col-span-2",
  "lg:col-span-1",
  "lg:col-span-1",
  "lg:col-span-2",
  "lg:col-span-2",
  "lg:col-span-1",
];

export function FeatureBento() {
  return (
    <Section ariaLabel="More features" containerClassName="max-w-none">
      <div className="mx-auto w-full max-w-xl">
        <Eyebrow>Everything else</Eyebrow>
        <h2 className="mt-5 text-balance text-3xl text-display text-foreground">
          A complete home for what you know.
        </h2>
      </div>

      <Stagger className="mx-auto mt-12 grid w-full max-w-4xl auto-rows-[19rem] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {bentoFeatures.map((feature, i) => {
          const Icon = icons[i] ?? MessagesSquare;
          const Visual = visuals[i];
          return (
            <StaggerItem className={cn("h-full", spans[i])} key={feature.title}>
              <div className="flex h-full flex-col overflow-hidden rounded-md bg-card p-4 shadow-borders-base">
                {/* Header */}
                <div className="flex items-center gap-x-2">
                  <span className="flex shrink-0 items-center justify-center text-foreground">
                    <Icon className="size-4" size={17} />
                  </span>
                  <h3 className="font-semibold text-foreground">
                    {feature.title}
                  </h3>
                </div>
                <Text className="mt-1.5 max-w-sm font-medium text-[12px] text-ui-fg-muted leading-4.5">
                  {feature.description}
                </Text>

                {/* Animated UI slot */}
                <div className="relative mt-4 min-h-0 flex-1">
                  {Visual ? <Visual /> : null}
                </div>
              </div>
            </StaggerItem>
          );
        })}
      </Stagger>
    </Section>
  );
}
