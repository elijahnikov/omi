import { cn } from "@omi/ui";
import { Heading } from "@omi/ui/heading";
import { RiArrowRightSFill } from "@remixicon/react";
import { AnimatePresence, motion } from "motion/react";
import { type ReactNode, useState } from "react";

export function CollapsibleSection({
  title,
  titleClassName,
  children,
  className,
  secondary,
  defaultCollapsed = false,
  collapsed: controlledCollapsed,
  onToggle,
}: {
  title: string;
  titleClassName?: string;
  children: ReactNode;
  className?: string;
  secondary?: ReactNode;
  defaultCollapsed?: boolean;
  collapsed?: boolean;
  onToggle?: () => void;
}) {
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
  const isControlled = controlledCollapsed !== undefined;
  const collapsed = isControlled ? controlledCollapsed : internalCollapsed;
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    }
    if (!isControlled) {
      setInternalCollapsed((prev) => !prev);
    }
  };

  return (
    <div className={className}>
      <button
        className="flex items-center gap-1"
        onClick={handleToggle}
        type="button"
      >
        <motion.div
          animate={{ rotate: collapsed ? 0 : 90 }}
          initial={false}
          transition={{ duration: 0.15, ease: "easeOut" }}
        >
          <RiArrowRightSFill className="h-3.5 w-3.5 text-ui-fg-muted" />
        </motion.div>
        <Heading className={cn("text-sm", titleClassName)} level="h3">
          {title}
        </Heading>
        {secondary}
      </button>
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            initial={{ height: 0, opacity: 0 }}
            onAnimationComplete={() => setIsAnimating(false)}
            onAnimationStart={() => setIsAnimating(true)}
            style={{ overflow: isAnimating ? "hidden" : "visible" }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
