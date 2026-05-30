import type { Id } from "@omi/backend/_generated/dataModel.js";
import { cn } from "@omi/ui";
import { Badge } from "@omi/ui/badge";
import { Skeleton } from "@omi/ui/skeleton";
import {
  RiFileFill,
  RiGlobeFill,
  RiPushpinFill,
  RiStickyNoteFill,
} from "@remixicon/react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { FileKindIcon } from "~/components/common/file-kind-icon";
import { CollapsibleSection } from "./collapsible-section";

interface PreviewData {
  domain?: string | null;
  favicon?: string | null;
  fileName?: string | null;
  fileUrl?: string | null;
  mimeType?: string | null;
  ogImage?: string | null;
  plainTextSnippet?: string | null;
}

interface LinkData {
  _id: Id<"resourceLink">;
  resource: {
    _id: Id<"resource">;
    title: string;
    type: string;
    preview: PreviewData;
  };
  score: number;
  sharedConcepts: string[];
  status: string;
}

function WebsiteIcon({ favicon }: { favicon?: string | null }) {
  if (favicon) {
    return (
      <img
        alt=""
        className="size-6 shrink-0 rounded-sm"
        height={16}
        src={favicon}
        width={16}
      />
    );
  }
  return <RiGlobeFill className="size-4 text-ui-fg-muted" />;
}

function ResourceIconContainer({
  type,
  preview,
}: {
  type: string;
  preview: PreviewData;
}) {
  if (type === "website") {
    return (
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
          !preview.favicon && "bg-ui-bg-subtle text-ui-fg-muted"
        )}
      >
        <WebsiteIcon favicon={preview.favicon} />
      </div>
    );
  }
  if (type === "note") {
    return (
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-ui-bg-subtle text-ui-fg-muted">
        <RiStickyNoteFill className="size-4" />
      </div>
    );
  }
  if (type === "file") {
    return (
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-ui-bg-subtle text-ui-fg-muted">
        <FileKindIcon
          className="size-4"
          fileName={preview.fileName}
          mimeType={preview.mimeType}
        />
      </div>
    );
  }
  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-ui-bg-subtle text-ui-fg-muted">
      <RiFileFill className="size-4" />
    </div>
  );
}

export function RelatedResources({
  links,
  aiStatus,
  workspaceId,
}: {
  links: LinkData[];
  aiStatus?: string;
  workspaceId: Id<"workspace">;
}) {
  const isProcessing = aiStatus === "pending" || aiStatus === "processing";

  const [wasProcessing, setWasProcessing] = useState(isProcessing);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (isProcessing) {
      setWasProcessing(true);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    } else if (wasProcessing && links.length === 0) {
      timerRef.current = setTimeout(() => setWasProcessing(false), 10_000);
      return () => clearTimeout(timerRef.current);
    } else {
      setWasProcessing(false);
    }
  }, [isProcessing, links.length, wasProcessing]);

  const showSkeleton = (isProcessing || wasProcessing) && links.length === 0;

  if (!showSkeleton && links.length === 0) {
    return null;
  }

  return (
    <CollapsibleSection
      className="mt-12"
      id="related-resources"
      secondary={
        showSkeleton ? undefined : (
          <Badge className="font-mono" size="sm" variant="outline">
            {Math.min(links.length, 6)}
          </Badge>
        )
      }
      title="Related Resources"
    >
      <AnimatePresence mode="wait">
        {showSkeleton ? (
          <motion.div
            className="mt-2 flex flex-col gap-1"
            exit={{ opacity: 0 }}
            key="skeleton"
            transition={{ duration: 0.15 }}
          >
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                className="flex items-center gap-3 px-3 py-2"
                key={`skeleton-${i.toString()}`}
              >
                <Skeleton className="size-8 shrink-0 rounded-md" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 flex flex-col"
            initial={{ opacity: 0, y: 4 }}
            key="links"
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            {links.slice(0, 6).map((link) => (
              <Link
                className="group relative flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-ui-bg-subtle"
                key={link._id}
                params={{
                  workspaceId,
                  resourceId: link.resource._id,
                }}
                preload="intent"
                to="/workspace/$workspaceId/resource/$resourceId"
              >
                <ResourceIconContainer
                  preview={link.resource.preview}
                  type={link.resource.type}
                />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-medium text-sm text-ui-fg-base">
                    {link.resource.title}
                  </span>
                </div>
                {link.status === "pinned" && (
                  <RiPushpinFill className="size-3 shrink-0 text-ui-fg-subtle" />
                )}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </CollapsibleSection>
  );
}
