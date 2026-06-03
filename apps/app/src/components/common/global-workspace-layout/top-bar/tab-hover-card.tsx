import { convexQuery } from "@convex-dev/react-query";
import { api } from "@omi/backend/_generated/api.js";
import type { Id } from "@omi/backend/_generated/dataModel.js";
import { Skeleton } from "@omi/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { FileKindIcon } from "~/components/common/file-kind-icon";
import {
  NoteIcon,
  WebsiteIcon,
} from "~/components/pages/library-page/resource-row";

interface ResourcePreview {
  favicon?: string | null;
  fileName?: string | null;
  fileUrl?: string | null;
  mimeType?: string | null;
  ogImage?: string | null;
  plainTextSnippet?: string | null;
  url?: string | null;
}

interface TabHoverCardProps {
  resourceId: string;
  title: string;
  workspaceId: string;
}

function CoverImage({
  src,
  alt,
  width,
  height,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
}) {
  const [broken, setBroken] = useState(false);
  if (broken) {
    return null;
  }
  return (
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: onError fallback for broken remote images
    <img
      alt={alt}
      className="size-full rounded-sm object-cover"
      height={height}
      onError={() => setBroken(true)}
      src={src}
      width={width}
    />
  );
}

function FaviconIcon({ favicon }: { favicon?: string | null }) {
  const [broken, setBroken] = useState(false);
  if (!favicon || broken) {
    return <WebsiteIcon favicon={null} />;
  }
  return (
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: onError fallback for broken remote images
    <img
      alt=""
      className="size-3.5 shrink-0 rounded-[3px] object-contain"
      height={14}
      onError={() => setBroken(true)}
      src={favicon}
      width={14}
    />
  );
}

function PathBreadcrumb({ path }: { path: string[] }) {
  if (path.length === 0) {
    return null;
  }
  return (
    <p className="truncate text-ui-fg-muted text-xs">{path.join(" / ")}</p>
  );
}

function WebsiteCard({
  title,
  preview,
  path,
}: {
  title: string;
  preview: ResourcePreview;
  path: string[];
}) {
  return (
    <div className="flex w-64 flex-col gap-2 px-0 py-1">
      <div className="flex flex-col gap-0.5">
        <div className="flex items-start gap-1.5">
          <span className="flex h-4 shrink-0 items-center justify-center">
            <FaviconIcon favicon={preview.favicon} />
          </span>
          <p className="line-clamp-2 min-w-0 flex-1 font-medium text-ui-fg-base text-xs">
            {title}
          </p>
        </div>
        {preview.url ? (
          <p className="truncate text-ui-fg-muted text-xs">{preview.url}</p>
        ) : null}
        <PathBreadcrumb path={path} />
      </div>
      {preview.ogImage ? (
        <div className="aspect-video w-full overflow-hidden rounded-sm bg-ui-bg-subtle">
          <CoverImage
            alt={title}
            height={144}
            src={preview.ogImage}
            width={256}
          />
        </div>
      ) : null}
    </div>
  );
}

function FileImageCard({
  title,
  preview,
  path,
}: {
  title: string;
  preview: ResourcePreview;
  path: string[];
}) {
  return (
    <div className="flex w-64 flex-col gap-2 px-0 py-1">
      <div className="flex flex-col gap-0.5">
        <div className="flex items-start gap-1.5">
          <span className="flex h-4 shrink-0 items-center justify-center">
            <FileKindIcon
              className="size-3.5"
              fileName={preview.fileName}
              mimeType={preview.mimeType}
            />
          </span>
          <p className="line-clamp-2 min-w-0 flex-1 font-medium text-ui-fg-base text-xs">
            {title}
          </p>
        </div>
        <PathBreadcrumb path={path} />
      </div>
      {preview.fileUrl ? (
        <div className="aspect-video w-full overflow-hidden rounded-sm bg-ui-bg-subtle">
          <CoverImage
            alt={title}
            height={144}
            src={preview.fileUrl}
            width={256}
          />
        </div>
      ) : null}
    </div>
  );
}

function ThumbnailCard({
  type,
  title,
  preview,
  path,
}: {
  type: "note" | "file";
  title: string;
  preview: ResourcePreview;
  path: string[];
}) {
  const isImageFile =
    type === "file" &&
    preview.mimeType?.startsWith("image/") &&
    preview.fileUrl;

  return (
    <div className="flex w-64 items-center gap-2.5 px-0 py-1">
      <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-ui-bg-subtle text-ui-fg-muted">
        {type === "note" && <NoteIcon />}
        {type === "file" &&
          (isImageFile ? (
            <CoverImage
              alt={title}
              height={40}
              src={preview.fileUrl as string}
              width={40}
            />
          ) : (
            <FileKindIcon
              className="size-4.5"
              fileName={preview.fileName}
              mimeType={preview.mimeType}
            />
          ))}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="line-clamp-2 font-medium text-ui-fg-base text-xs">
          {title}
        </p>
        {type === "note" && preview.plainTextSnippet ? (
          <p className="line-clamp-2 text-ui-fg-subtle text-xs">
            {preview.plainTextSnippet}
          </p>
        ) : null}
        <PathBreadcrumb path={path} />
      </div>
    </div>
  );
}

export function TabHoverCard({
  resourceId,
  workspaceId,
  title,
}: TabHoverCardProps) {
  const { data, isLoading } = useQuery(
    convexQuery(api.resource.queries.getTabPreview, {
      resourceId: resourceId as Id<"resource">,
      workspaceId: workspaceId as Id<"workspace">,
    })
  );

  if (isLoading) {
    return (
      <div className="flex w-64 items-start gap-2.5 p-2">
        <Skeleton className="size-10 shrink-0 rounded-md" />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5 pt-0.5">
          <Skeleton className="h-3.5 w-3/4 rounded-sm" />
          <Skeleton className="h-3 w-1/2 rounded-sm" />
        </div>
      </div>
    );
  }

  const displayTitle = data?.title ?? title;
  const type = data?.type ?? "website";
  const preview: ResourcePreview = data?.preview ?? {};
  const path = data?.path ?? [];

  if (type === "website") {
    return <WebsiteCard path={path} preview={preview} title={displayTitle} />;
  }

  if (
    type === "file" &&
    preview.mimeType?.startsWith("image/") &&
    preview.fileUrl
  ) {
    return <FileImageCard path={path} preview={preview} title={displayTitle} />;
  }

  return (
    <ThumbnailCard
      path={path}
      preview={preview}
      title={displayTitle}
      type={type}
    />
  );
}
