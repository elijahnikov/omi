import type { GetResourceData } from "~/lib/convex-types";

export type SyncedKind = "issue" | "pr" | "page";

export interface SyncedViewModel {
  diffPatch?: string;
  externalUrl?: string;
  kind: SyncedKind;
  markdownContent?: string;
  providerId: string;
  subtitle?: string;
}

export function isSyncedResource(resource: GetResourceData): boolean {
  if (resource.type === "synced") {
    return true;
  }
  return Boolean("sourceProviderId" in resource && resource.sourceProviderId);
}

function legacyKindFromExternalId(
  providerId: string,
  externalId?: string
): SyncedKind {
  if (providerId === "notion") {
    return "page";
  }
  if (externalId?.startsWith("pr:")) {
    return "pr";
  }
  return "issue";
}

export function getSyncedViewModel(
  resource: GetResourceData
): SyncedViewModel | null {
  if (resource.type === "synced" && "synced" in resource && resource.synced) {
    return {
      providerId: resource.synced.providerId,
      kind: resource.synced.kind,
      externalUrl: resource.synced.externalUrl,
      markdownContent: resource.synced.markdownContent ?? undefined,
      diffPatch: resource.synced.diffPatch ?? undefined,
      subtitle: resource.synced.subtitle ?? resource.description ?? undefined,
    };
  }

  const providerId =
    "sourceProviderId" in resource ? resource.sourceProviderId : undefined;
  if (!providerId) {
    return null;
  }

  const externalId =
    "sourceExternalId" in resource ? resource.sourceExternalId : undefined;
  const externalUrl =
    "sourceExternalUrl" in resource ? resource.sourceExternalUrl : undefined;
  const content = "content" in resource ? resource.content : null;

  let markdownContent =
    content?.markdownContent ?? content?.plainTextContent ?? undefined;

  if (
    !markdownContent &&
    resource.type === "website" &&
    "website" in resource
  ) {
    markdownContent = resource.website?.articleContent ?? undefined;
  }
  if (!markdownContent && resource.type === "note" && "note" in resource) {
    markdownContent =
      resource.note?.plainTextContent ??
      resource.note?.htmlContent ??
      undefined;
  }

  return {
    providerId,
    kind: legacyKindFromExternalId(providerId, externalId),
    externalUrl: externalUrl ?? undefined,
    markdownContent,
    subtitle: resource.description ?? undefined,
  };
}
