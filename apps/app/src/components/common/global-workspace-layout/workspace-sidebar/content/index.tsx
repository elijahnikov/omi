import { convexQuery } from "@convex-dev/react-query";
import { api } from "@omi/backend/_generated/api.js";
import type { Id } from "@omi/backend/_generated/dataModel.js";
import { cn } from "@omi/ui";
import { SidebarContent } from "@omi/ui/sidebar";
import { TooltipProvider } from "@omi/ui/tooltip";
import {
  RiBookletFill,
  RiBookmarkFill,
  RiChat1Fill,
  RiHashtag,
  RiHome3Fill,
  RiSearch2Fill,
  RiStickyNoteFill,
} from "@remixicon/react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "@tanstack/react-router";
import type { FunctionReturnType } from "convex/server";
import { useMemo } from "react";
import { CollapsibleSection } from "~/components/common/collapsible-section";
import { FileKindIcon } from "~/components/common/file-kind-icon";
import SidebarLinkItem from "~/components/common/global-workspace-layout/workspace-sidebar/sidebar-link-item";
import { getNavShortcutByTitle } from "~/lib/hotkeys/registry";
import { useSidebarStore } from "~/lib/sidebar-store";

type PinnedResource = FunctionReturnType<
  typeof api.resource.queries.list
>["page"][number];

export default function WorkspaceSidebarContent() {
  const params = useParams({ strict: false }) as {
    workspaceId?: string;
    resourceId?: string;
  };
  const pathname = useLocation({ select: (location) => location.pathname });
  const sidebarOpen = useSidebarStore((s) => s.open);

  const { data: pinnedResources } = useQuery({
    ...convexQuery(
      api.resource.queries.listPinned,
      params?.workspaceId
        ? { workspaceId: params.workspaceId as Id<"workspace"> }
        : "skip"
    ),
    enabled: Boolean(params?.workspaceId),
  });

  const navigationItems = useMemo(() => {
    if (!params?.workspaceId) {
      return [];
    }

    const workspacePath = `/workspace/${params.workspaceId}`;

    return [
      {
        icon: RiHome3Fill,
        title: "Home",
        url: `/workspace/${params.workspaceId}`,
        isActive: pathname === workspacePath,
      },
      {
        icon: RiBookmarkFill,
        title: "Library",
        url: `/workspace/${params.workspaceId}/library`,
        isActive: pathname === `${workspacePath}/library`,
      },
      {
        icon: RiSearch2Fill,
        title: "Search",
        url: `/workspace/${params.workspaceId}/search`,
        isActive: pathname === `${workspacePath}/search`,
      },
      {
        icon: RiChat1Fill,
        title: "Chat",
        url: `/workspace/${params.workspaceId}/chat`,
        isActive: pathname.startsWith(`${workspacePath}/chat`),
      },
      {
        icon: RiHashtag,
        title: "Tags",
        url: `/workspace/${params.workspaceId}/tags`,
        isActive:
          pathname === `${workspacePath}/tags` ||
          pathname.includes(`${workspacePath}/tags`),
      },
      {
        icon: RiBookletFill,
        title: "Journal",
        url: `/workspace/${params.workspaceId}/journal`,
        isActive: pathname.startsWith(`${workspacePath}/journal`),
      },
    ];
  }, [pathname, params?.workspaceId]);

  const pinnedItems = pinnedResources ?? [];

  return (
    <SidebarContent
      className={cn(sidebarOpen ? "px-2" : "pl-2", "w-full pt-1")}
    >
      <TooltipProvider>
        <div className="flex w-full flex-col gap-1">
          {navigationItems.map((item) => (
            <SidebarLinkItem
              icon={item.icon}
              isActive={item.isActive}
              key={item.title}
              shortcut={getNavShortcutByTitle(item.title)}
              sidebarOpen={sidebarOpen}
              title={item.title}
              url={item.url}
            />
          ))}
        </div>
        {params?.workspaceId && pinnedItems.length > 0 && (
          <PinnedSection
            activeResourceId={params.resourceId}
            resources={pinnedItems}
            sidebarOpen={sidebarOpen}
            workspaceId={params.workspaceId}
          />
        )}
      </TooltipProvider>
    </SidebarContent>
  );
}

function PinnedSection({
  activeResourceId,
  resources,
  sidebarOpen,
  workspaceId,
}: {
  activeResourceId?: string;
  resources: PinnedResource[];
  sidebarOpen: boolean;
  workspaceId: string;
}) {
  const items = (
    <div className={cn("flex w-full flex-col gap-1", sidebarOpen && "mt-1")}>
      {resources.map((resource) => (
        <SidebarLinkItem
          iconNode={<ResourceIcon resource={resource} />}
          isActive={activeResourceId === resource._id}
          key={resource._id}
          sidebarOpen={sidebarOpen}
          title={resource.title || "Untitled"}
          url={`/workspace/${workspaceId}/resource/${resource._id}`}
        />
      ))}
    </div>
  );

  if (!sidebarOpen) {
    return <div className="mt-2">{items}</div>;
  }

  return (
    <CollapsibleSection
      className="mt-3"
      title="Pinned"
      titleClassName="text-xs font-medium text-ui-fg-muted"
    >
      {items}
    </CollapsibleSection>
  );
}

function ResourceIcon({ resource }: { resource: PinnedResource }) {
  if (resource.type === "website") {
    const website = "website" in resource ? resource.website : null;
    const favicon = website?.favicon;
    if (favicon) {
      return (
        <img
          alt=""
          className="size-3.5 rounded-[2px]"
          height={14}
          src={favicon}
          width={14}
        />
      );
    }
    return (
      <svg
        aria-hidden="true"
        className="size-3.5 text-ui-fg-muted"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        viewBox="0 0 24 24"
      >
        <path
          d="M12 21a9 9 0 100-18 9 9 0 000 18z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3.6 9h16.8M3.6 15h16.8M12 3a15 15 0 014 9 15 15 0 01-4 9 15 15 0 01-4-9 15 15 0 014-9z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (resource.type === "note") {
    return <RiStickyNoteFill className="size-3.5 text-ui-fg-muted" />;
  }

  if (resource.type === "file") {
    const file = "file" in resource ? resource.file : null;
    return (
      <FileKindIcon
        className="size-3.5"
        fileName={file?.fileName}
        mimeType={file?.mimeType}
      />
    );
  }

  return null;
}
