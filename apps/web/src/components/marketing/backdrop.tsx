import { cn } from "@omi/ui";

/**
 * Decorative, non-interactive ambiance layers. All `aria-hidden` so they never
 * reach the accessibility tree.
 */

export function DotGrid({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "dot-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(70%_60%_at_50%_30%,black,transparent)]",
        className
      )}
    />
  );
}
