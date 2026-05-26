import { useEffect, useState } from "react";

export function useElementOffset(
  element: HTMLElement | null,
  scrollEl: HTMLElement | null
): number {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (!(element && scrollEl)) {
      return;
    }

    let frame = 0;
    const measure = () => {
      const elRect = element.getBoundingClientRect();
      const scrollRect = scrollEl.getBoundingClientRect();
      const next = elRect.top - scrollRect.top + scrollEl.scrollTop;
      setOffset((prev) => (prev === next ? prev : next));
    };

    measure();

    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    });
    observer.observe(element);
    observer.observe(scrollEl);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [element, scrollEl]);

  return offset;
}
