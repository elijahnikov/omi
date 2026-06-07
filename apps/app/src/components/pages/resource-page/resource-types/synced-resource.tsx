import { lazy, Suspense } from "react";
import { PageContent } from "~/components/common/page-content";
import type { GetResourceData } from "~/lib/convex-types";
import { getSyncedViewModel } from "~/lib/synced-resource";
import { RelatedResources } from "../related-resources";
import { ResourceHeader } from "../resource-header";
import { ResourceSummary } from "../resource-summary";
import { ResourceTags } from "../resource-tags";

const NoteEditor = lazy(() => import("./note-editor"));
const GithubPrDiff = lazy(() =>
  import("./github-pr-diff").then((module) => ({
    default: module.GithubPrDiff,
  }))
);

function PrDiffFallback() {
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

export function SyncedResource({ resource }: { resource: GetResourceData }) {
  const synced = getSyncedViewModel(resource);
  if (!synced) {
    return null;
  }

  const content = "content" in resource ? resource.content : null;
  const jsonContent = content?.jsonContent ?? undefined;
  const fallbackMarkdown = jsonContent
    ? undefined
    : (synced.markdownContent ?? undefined);
  const showDiff = synced.kind === "pr" && Boolean(synced.diffPatch);

  return (
    <PageContent className="mt-2">
      <ResourceHeader resource={resource} />

      <ResourceTags
        aiStatus={resource.resourceAI?.status}
        resourceId={resource._id}
        tags={resource.tags}
        workspaceId={resource.workspaceId}
      />
      <ResourceSummary resource={resource} />
      {"links" in resource && (
        <RelatedResources
          aiStatus={resource.resourceAI?.status}
          links={resource.links}
          workspaceId={resource.workspaceId}
        />
      )}

      {showDiff && synced.diffPatch ? (
        <Suspense fallback={<PrDiffFallback />}>
          <GithubPrDiff patch={synced.diffPatch} />
        </Suspense>
      ) : null}

      <Suspense fallback={<div className="mt-6 min-h-[100px]" />}>
        <NoteEditor
          fallbackMarkdown={fallbackMarkdown}
          initialContent={jsonContent}
          key={`${resource._id}:${"syncedAt" in resource ? (resource.syncedAt ?? 0) : 0}`}
          resourceId={resource._id}
          workspaceId={resource.workspaceId}
        />
      </Suspense>
    </PageContent>
  );
}
