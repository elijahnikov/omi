import { useTheme } from "@omi/ui/theme";
import type { FileDiffMetadata } from "@pierre/diffs";
import { processFile } from "@pierre/diffs";
import { FileDiff } from "@pierre/diffs/react";
import { RiArrowRightSFill, RiFileCodeFill } from "@remixicon/react";
import { motion } from "motion/react";
import {
  memo,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { getCodeLanguage } from "~/lib/format";
import type { PrPatchFileChunk } from "~/lib/parse-pr-patch";
import { splitPatchIntoFileChunks } from "~/lib/parse-pr-patch";

const LIGHT_THEME = "github-light-high-contrast" as const;
const DARK_THEME = "github-dark-high-contrast" as const;

const PIERRE_MONO_CSS = `
  :host {
    --diffs-font-family: "IoskeleyMono", var(--diffs-font-fallback);
  }
`;

function useDiffOptions(resolvedTheme: "light" | "dark") {
  return useMemo(
    () => ({
      diffStyle: "split" as const,
      disableFileHeader: true,
      theme: resolvedTheme === "dark" ? DARK_THEME : LIGHT_THEME,
      themeType: resolvedTheme,
      unsafeCSS: PIERRE_MONO_CSS,
    }),
    [resolvedTheme]
  );
}

const PrDiffFile = memo(function PrDiffFile({
  fileChunk,
  index,
  resolvedTheme,
}: {
  fileChunk: PrPatchFileChunk;
  index: number;
  resolvedTheme: "light" | "dark";
}) {
  const [expanded, setExpanded] = useState(false);
  const [fileDiff, setFileDiff] = useState<FileDiffMetadata | null>(null);
  const [isPending, startTransition] = useTransition();
  const diffOptions = useDiffOptions(resolvedTheme);

  useEffect(() => {
    if (!expanded) {
      setFileDiff(null);
      return;
    }

    let cancelled = false;
    const scheduleParse =
      typeof requestIdleCallback === "function"
        ? requestIdleCallback
        : (callback: () => void) => window.setTimeout(callback, 0);
    const cancelParse =
      typeof cancelIdleCallback === "function"
        ? cancelIdleCallback
        : window.clearTimeout;

    const handle = scheduleParse(() => {
      if (cancelled) {
        return;
      }

      const parsed = processFile(fileChunk.chunk, {
        cacheKey: `pr-file-${index}`,
        isGitDiff: fileChunk.isGitDiff,
      });

      startTransition(() => {
        if (!cancelled) {
          setFileDiff(parsed ?? null);
        }
      });
    });

    return () => {
      cancelled = true;
      cancelParse(handle);
    };
  }, [expanded, fileChunk.chunk, fileChunk.isGitDiff, index]);

  const { fileName, additions, deletions } = fileChunk;
  const language = getCodeLanguage(fileName);

  return (
    <div className="overflow-hidden rounded-sm border border-ui-border-base">
      <button
        className="flex w-full items-center gap-2 border-ui-border-base border-b bg-ui-bg-subtle px-3 py-2 text-left transition-colors hover:bg-ui-bg-component-hover dark:hover:bg-ui-bg-component"
        onClick={() => setExpanded((prev) => !prev)}
        type="button"
      >
        <motion.span
          animate={{ rotate: expanded ? 90 : 0 }}
          className="flex shrink-0 items-center justify-center"
          initial={false}
          transition={{ duration: 0.15, ease: "easeOut" }}
        >
          <RiArrowRightSFill className="size-3.5 text-ui-fg-muted" />
        </motion.span>
        <RiFileCodeFill className="size-3.5 shrink-0 text-ui-fg-muted" />
        <span className="min-w-0 flex-1 truncate font-mono text-ui-fg-subtle text-xs">
          {fileName}
        </span>
        {additions > 0 || deletions > 0 ? (
          <span className="shrink-0 font-mono text-xs">
            {additions > 0 ? (
              <span className="text-green-600 dark:text-green-400">
                +{additions}
              </span>
            ) : null}
            {additions > 0 && deletions > 0 ? " " : null}
            {deletions > 0 ? (
              <span className="text-red-600 dark:text-red-400">
                -{deletions}
              </span>
            ) : null}
          </span>
        ) : null}
        {language ? (
          <span className="shrink-0 font-mono text-ui-fg-muted text-xs">
            {language}
          </span>
        ) : null}
      </button>
      {expanded ? (
        <div className="max-h-[400px] overflow-auto">
          {fileDiff ? (
            <FileDiff
              fileDiff={fileDiff}
              key={`${fileChunk.id}-${resolvedTheme}-open`}
              options={diffOptions}
            />
          ) : (
            <div className="flex h-24 items-center justify-center text-ui-fg-muted text-xs">
              {isPending ? "Loading diff…" : null}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
});

export function GithubPrDiff({ patch }: { patch: string }) {
  const { resolvedTheme } = useTheme();
  const deferredPatch = useDeferredValue(patch);

  const fileChunks = useMemo(
    () => splitPatchIntoFileChunks(deferredPatch),
    [deferredPatch]
  );

  if (deferredPatch !== patch) {
    return (
      <div className="mt-4 space-y-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            className="h-10 animate-pulse rounded-sm border border-ui-border-base bg-ui-bg-subtle"
            key={index}
          />
        ))}
      </div>
    );
  }

  if (fileChunks.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 space-y-3">
      {fileChunks.map((fileChunk, index) => (
        <PrDiffFile
          fileChunk={fileChunk}
          index={index}
          key={fileChunk.id}
          resolvedTheme={resolvedTheme}
        />
      ))}
    </div>
  );
}
