import { lazy, Suspense } from "react";
import { PageContent } from "~/components/common/page-content";
import type { GetResourceData } from "~/lib/convex-types";
import { getSyncedViewModel } from "~/lib/synced-resource";
import { RelatedResources } from "../related-resources";
import { ResourceHeader } from "../resource-header";
import { ResourceSummary } from "../resource-summary";
import { ResourceTags } from "../resource-tags";
import { GithubPrDiff } from "./github-pr-diff";

const NoteEditor = lazy(() => import("./note-editor"));

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
  const showEditor =
    synced.kind !== "pr" || Boolean(fallbackMarkdown || jsonContent);

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
        <GithubPrDiff patch={synced.diffPatch} />
      ) : null}

      {showEditor ? (
        <Suspense fallback={<div className="mt-6 min-h-[100px]" />}>
          <NoteEditor
            fallbackMarkdown={fallbackMarkdown}
            initialContent={jsonContent}
            key={`${resource._id}:${"syncedAt" in resource ? (resource.syncedAt ?? 0) : 0}`}
            resourceId={resource._id}
            workspaceId={resource.workspaceId}
          />
        </Suspense>
      ) : null}
    </PageContent>
  );
}
