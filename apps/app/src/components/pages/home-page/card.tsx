import { cn } from "@omi/ui";

export function HomeCard({
  className,
  children,
  interactive = false,
  ...props
}: React.ComponentProps<"div"> & { interactive?: boolean }) {
  return (
    <div
      className={cn(
        "relative flex flex-col gap-2 rounded-lg p-2",
        interactive &&
          "transition-colors hover:bg-ui-bg-component-hover dark:hover:bg-ui-bg-component",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
