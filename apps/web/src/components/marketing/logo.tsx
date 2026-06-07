import { cn } from "@omi/ui";

/** Omi wordmark. */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex select-none items-baseline font-semibold text-foreground text-lg tracking-tight",
        className
      )}
    >
      omi
    </span>
  );
}
