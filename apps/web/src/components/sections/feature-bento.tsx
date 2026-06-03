import {
  CalendarDays,
  FolderTree,
  Import,
  MessagesSquare,
  NotebookPen,
  Share2,
} from "lucide-react";
import { Eyebrow } from "~/components/marketing/eyebrow";
import { Section } from "~/components/marketing/section";
import { Stagger, StaggerItem } from "~/components/motion/stagger";
import { bentoFeatures } from "~/lib/features";

const icons = [
  MessagesSquare,
  CalendarDays,
  Share2,
  NotebookPen,
  FolderTree,
  Import,
];

export function FeatureBento() {
  return (
    <Section ariaLabel="More features">
      <div className="max-w-2xl">
        <Eyebrow>Everything else</Eyebrow>
        <h2 className="mt-5 text-balance text-3xl text-display text-foreground">
          A complete home for what you know.
        </h2>
      </div>

      <Stagger className="mt-12 grid gap-3">
        {bentoFeatures.map((feature, i) => {
          const Icon = icons[i] ?? MessagesSquare;
          return (
            <StaggerItem key={feature.title}>
              <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft-sm transition-shadow hover:shadow-soft">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-foreground">
                  <Icon size={18} />
                </span>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-1 text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            </StaggerItem>
          );
        })}
      </Stagger>
    </Section>
  );
}
