import { PatchDiff } from "@pierre/diffs/react";

const DIFF_OPTIONS = {
  diffStyle: "split" as const,
  theme: {
    light: "github-light-high-contrast" as const,
    dark: "github-dark-high-contrast" as const,
  },
};

export function GithubPrDiff({ patch }: { patch: string }) {
  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-ui-border-base">
      <div className="max-h-[720px] overflow-auto">
        <PatchDiff disableWorkerPool options={DIFF_OPTIONS} patch={patch} />
      </div>
    </div>
  );
}
