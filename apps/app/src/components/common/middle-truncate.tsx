import { layoutWithLines, prepareWithSegments } from "@chenglou/pretext";
import { useEffect, useRef, useState } from "react";

const ELLIPSIS = "…";

function measure(text: string, font: string): number {
  const prepared = prepareWithSegments(text, font);
  const result = layoutWithLines(prepared, Number.MAX_SAFE_INTEGER, 16);
  return result.lines[0]?.width ?? 0;
}

function middleTruncate(text: string, font: string, maxWidth: number): string {
  if (text.length === 0 || maxWidth <= 0) {
    return text;
  }

  if (measure(text, font) <= maxWidth) {
    return text;
  }

  const ellipsisWidth = measure(ELLIPSIS, font);
  const available = maxWidth - ellipsisWidth;
  if (available <= 0) {
    return ELLIPSIS;
  }

  let lo = 0;
  let hi = text.length;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (measure(text.slice(0, mid), font) <= available / 2) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
  }
  const startLen = lo;
  const startWidth = startLen > 0 ? measure(text.slice(0, startLen), font) : 0;

  const remainingBudget = available - startWidth;
  lo = 0;
  hi = text.length - startLen;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (measure(text.slice(text.length - mid), font) <= remainingBudget) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
  }
  const endLen = lo;

  if (startLen === 0 && endLen === 0) {
    return ELLIPSIS;
  }

  const start = text.slice(0, startLen);
  const end = endLen > 0 ? text.slice(text.length - endLen) : "";
  return `${start}${ELLIPSIS}${end}`;
}

// Truncates a URL pathname while keeping the last segment intact.
// e.g. "/hub/blog/personal-computer-is-here" → "/…/personal-computer-is-here"
// If the last segment alone doesn't fit, falls back to a middle-truncate
// of the segment itself (still prefixed with "/…/").
function urlPathTruncate(
  pathname: string,
  font: string,
  maxWidth: number
): string {
  if (pathname.length === 0 || maxWidth <= 0) {
    return pathname;
  }
  if (measure(pathname, font) <= maxWidth) {
    return pathname;
  }

  const lastSlashIdx = pathname.lastIndexOf("/");
  if (lastSlashIdx <= 0) {
    return middleTruncate(pathname, font, maxWidth);
  }

  const lastSegment = pathname.slice(lastSlashIdx + 1);
  const prefix = `/${ELLIPSIS}/`;
  const candidate = `${prefix}${lastSegment}`;

  if (measure(candidate, font) <= maxWidth) {
    return candidate;
  }

  // Not enough room to keep the full last segment with a /…/ prefix.
  // Falling back to middle-truncating the whole pathname keeps characters
  // visible from both ends (e.g. "/hub/bl…r-is-here") instead of degrading
  // to "/…/…" which tells the user nothing.
  return middleTruncate(pathname, font, maxWidth);
}

function useTruncatedText(
  text: string,
  truncate: (text: string, font: string, maxWidth: number) => string
) {
  const ref = useRef<HTMLSpanElement>(null);
  const [result, setResult] = useState(text);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    const parent = el.parentElement;
    if (!parent) {
      return;
    }

    const update = () => {
      const style = getComputedStyle(el);
      const font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      setResult(truncate(text, font, parent.clientWidth));
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(parent);
    return () => observer.disconnect();
  }, [text, truncate]);

  return { ref, result };
}

export function MiddleTruncate({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const { ref, result } = useTruncatedText(text, middleTruncate);
  return (
    <span className={className} ref={ref}>
      {result}
    </span>
  );
}

export function URLPathTruncate({
  pathname,
  className,
}: {
  pathname: string;
  className?: string;
}) {
  const { ref, result } = useTruncatedText(pathname, urlPathTruncate);
  return (
    <span className={className} ref={ref}>
      {result}
    </span>
  );
}
