import { cn } from "@omi/ui";

interface SectionProps {
  ariaLabel?: string;
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  id?: string;
}

/**
 * Consistent vertical rhythm + max-width container for marketing sections.
 */
export function Section({
  children,
  className,
  containerClassName,
  id,
  ariaLabel,
}: SectionProps) {
  return (
    <section
      aria-label={ariaLabel}
      className={cn("relative px-5 py-20 sm:px-8 sm:py-28", className)}
      id={id}
    >
      <div className={cn("mx-auto w-full max-w-xl", containerClassName)}>
        {children}
      </div>
    </section>
  );
}
