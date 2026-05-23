import type { api } from "@omi/backend/_generated/api.js";
import type { Id } from "@omi/backend/_generated/dataModel.js";
import { Badge } from "@omi/ui/badge";
import { Text } from "@omi/ui/text";
import { RiGlobeFill, RiLinkM, RiStickyNoteFill } from "@remixicon/react";
import { Link } from "@tanstack/react-router";
import type { FunctionReturnType } from "convex/server";
import { FileKindIcon } from "~/components/common/file-kind-icon";
import { HomeCard } from "./card";

type HomeData = FunctionReturnType<typeof api.home.queries.getHome>;
type RecentConnectionsGroup = NonNullable<
  HomeData["ai"]
>["recentConnections"][number];

export type RecentConnection = RecentConnectionsGroup;

function formatRelative(timestamp: number, now: number): string {
  const days = Math.max(
    1,
    Math.floor((now - timestamp) / (24 * 60 * 60 * 1000))
  );
  if (days < 1) {
    return "Today";
  }
  if (days === 1) {
    return "Yesterday";
  }
  if (days < 7) {
    return `${days}d ago`;
  }
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `${weeks}w ago`;
  }
  const months = Math.floor(days / 30);
  if (months < 12) {
    return `${months}mo ago`;
  }
  const years = Math.floor(months / 12);
  return `${years}y ago`;
}

export function RecentConnectionCard({
  workspaceId,
  connection,
}: {
  workspaceId: Id<"workspace">;
  connection: RecentConnection;
}) {
  const allSharedConcepts = Array.from(
    new Set(connection.others.flatMap((o) => o.sharedConcepts))
  ).slice(0, 4);

  const newerRelative = formatRelative(
    connection.newer.updatedAt ?? connection.newer._creationTime,
    Date.now()
  );

  return (
    <HomeCard>
      <div className="relative flex flex-col">
        {/* Vertical rail that connects all the avatars. */}
        <span
          aria-hidden
          className="absolute top-7 bottom-[14px] left-3.5 w-px -translate-x-1/2 bg-ui-border-base"
        />

        <PivotRow
          concepts={allSharedConcepts}
          label="New"
          relative={newerRelative}
          resource={connection.newer}
          workspaceId={workspaceId}
        />

        {connection.others.map((other) => (
          <CounterpartRow
            key={other.linkId}
            relative={formatRelative(other.resource.updatedAt, Date.now())}
            resource={other.resource}
            workspaceId={workspaceId}
          />
        ))}
      </div>
    </HomeCard>
  );
}

function PivotRow({
  workspaceId,
  resource,
  label,
  relative,
  concepts,
}: {
  workspaceId: Id<"workspace">;
  resource: RecentConnection["newer"];
  label: string;
  relative: string;
  concepts: string[];
}) {
  return (
    <div className="relative flex items-start gap-3">
      <div className="relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full bg-ui-bg-subtle text-ui-fg-muted">
        <RiLinkM className="size-3.5" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1 pb-3">
        <div className="flex items-center gap-2">
          <Badge size="sm" variant="mono">
            {label}
          </Badge>
          <Text className="text-ui-fg-muted" size="small">
            {relative}
          </Text>
        </div>
        <div className="flex min-w-0 items-center gap-1.5">
          <ResourceTypeIcon resource={resource} />
          <ResourceTitleLink resource={resource} workspaceId={workspaceId} />
        </div>
        {concepts.length > 0 ? (
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
            <Text className="text-ui-fg-muted" size="small">
              via
            </Text>
            {concepts.map((c) => (
              <span
                className="inline-flex items-center rounded-full bg-ui-bg-subtle px-2 py-0.5 text-[12px] text-ui-fg-base"
                key={c}
              >
                {c}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function CounterpartRow({
  workspaceId,
  resource,
  relative,
}: {
  workspaceId: Id<"workspace">;
  resource: RecentConnection["others"][number]["resource"];
  relative: string;
}) {
  return (
    <div className="relative flex flex-col pt-2 last:pb-0">
      <Text className="pl-10 text-ui-fg-muted" size="small">
        {relative}
      </Text>
      <div className="mt-0.5 flex items-center gap-3">
        <div className="relative flex size-7 shrink-0 items-center justify-center">
          <span className="relative z-10 size-1.5 rounded-full bg-ui-fg-muted" />
        </div>
        <div className="flex min-w-0 items-center gap-1.5">
          <ResourceTypeIcon resource={resource} />
          <ResourceTitleLink resource={resource} workspaceId={workspaceId} />
        </div>
      </div>
    </div>
  );
}

function ResourceTypeIcon({
  resource,
}: {
  resource: RecentConnection["newer"];
}) {
  if (resource.type === "website") {
    const favicon = "website" in resource ? resource.website?.favicon : null;
    if (favicon) {
      return (
        <img
          alt=""
          className="size-3.5 shrink-0 rounded-[4px]"
          height={14}
          src={favicon}
          width={14}
        />
      );
    }
    return <RiGlobeFill className="size-3.5 shrink-0 text-ui-fg-muted" />;
  }
  if (resource.type === "note") {
    return <RiStickyNoteFill className="size-3.5 shrink-0 text-ui-fg-muted" />;
  }
  if (resource.type === "file") {
    const file = "file" in resource ? resource.file : null;
    const fileUrl = "fileUrl" in resource ? resource.fileUrl : null;
    if (file?.mimeType?.startsWith("image/") && fileUrl) {
      return (
        <img
          alt=""
          className="size-3.5 shrink-0 rounded-[2px] object-cover"
          height={14}
          src={fileUrl}
          width={14}
        />
      );
    }
    return (
      <FileKindIcon
        className="size-3.5 shrink-0"
        fileName={file?.fileName}
        mimeType={file?.mimeType}
      />
    );
  }
  return null;
}

function ResourceTitleLink({
  workspaceId,
  resource,
}: {
  workspaceId: Id<"workspace">;
  resource: { _id: Id<"resource">; title: string };
}) {
  return (
    <Link
      className="line-clamp-1 font-medium text-sm text-ui-fg-base transition-colors hover:text-ui-fg-interactive"
      params={{ workspaceId, resourceId: resource._id }}
      preload="intent"
      to="/workspace/$workspaceId/resource/$resourceId"
    >
      {resource.title}
    </Link>
  );
}
