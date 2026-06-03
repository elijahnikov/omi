import { cn } from "@omi/ui";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Light surface card: white fill, hairline border, soft shadow, rounded.
 */
export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-6 shadow-soft-sm",
        className
      )}
    >
      {children}
    </div>
  );
}
