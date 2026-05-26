import { useEffect, useState } from "react";

function findScrollAncestor(el: HTMLElement | null): HTMLElement | null {
  let node = el?.parentElement ?? null;
  while (node) {
    const overflowY = getComputedStyle(node).overflowY;
    if (
      overflowY === "auto" ||
      overflowY === "scroll" ||
      overflowY === "overlay"
    ) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
}

export function useScrollAncestor(
  element: HTMLElement | null
): HTMLElement | null {
  const [scrollEl, setScrollEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setScrollEl(findScrollAncestor(element));
  }, [element]);

  return scrollEl;
}
