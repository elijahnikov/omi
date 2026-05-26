import type { Virtualizer } from "@tanstack/react-virtual";
import { useEffect } from "react";
import { scrollActiveIntoView } from "./use-list-navigation";

export function useVirtualizedNavScroll({
  virtualizer,
  activeId,
  getIndexForId,
  fallbackScrollEl,
}: {
  virtualizer: Virtualizer<HTMLElement, Element>;
  activeId: string | null;
  getIndexForId: (id: string) => number | null;
  fallbackScrollEl?: HTMLElement | null;
}) {
  useEffect(() => {
    if (!activeId) {
      return;
    }
    const idx = getIndexForId(activeId);
    if (idx === null) {
      scrollActiveIntoView(fallbackScrollEl ?? null);
      return;
    }
    virtualizer.scrollToIndex(idx, { align: "auto" });
  }, [activeId, getIndexForId, virtualizer, fallbackScrollEl]);
}
