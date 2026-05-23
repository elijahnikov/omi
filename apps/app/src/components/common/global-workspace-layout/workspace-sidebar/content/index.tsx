import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { api } from "@omi/backend/_generated/api.js";
import type { Id } from "@omi/backend/_generated/dataModel.js";
import { cn } from "@omi/ui";
import { ContextMenu } from "@omi/ui/context-menu";
import { ScrollArea } from "@omi/ui/scroll-area";
import { SidebarContent } from "@omi/ui/sidebar";
import { toastManager } from "@omi/ui/toast";
import { TooltipProvider } from "@omi/ui/tooltip";
import {
  RiArrowRightSFill,
  RiBookletFill,
  RiBookmarkFill,
  RiChat1Fill,
  RiDeleteBinFill,
  RiDownloadFill,
  RiExternalLinkFill,
  RiFileCopyFill,
  RiHashtag,
  RiHome3Fill,
  RiPushpinFill,
  RiSearch2Fill,
  RiStickyNoteFill,
  RiUnpinFill,
} from "@remixicon/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate, useParams } from "@tanstack/react-router";
import type { FunctionReturnType } from "convex/server";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useMemo, useState } from "react";
import { CollectionIcon } from "~/components/common/collection-icon";
import { FileKindIcon } from "~/components/common/file-kind-icon";
import SidebarLinkItem from "~/components/common/global-workspace-layout/workspace-sidebar/sidebar-link-item";
import { getNavShortcutByTitle } from "~/lib/hotkeys/registry";
import { useSidebarStore } from "~/lib/sidebar-store";
import { closeResourceTabs } from "~/lib/workspace-tabs-store";

type PinnedResource = FunctionReturnType<
  typeof api.resource.queries.list
>["page"][number];

type PinnedCollection = FunctionReturnType<
  typeof api.collection.queries.listPinned
>[number];

export default function WorkspaceSidebarContent() {
  const params = useParams({ strict: false }) as {
    workspaceId?: string;
    resourceId?: string;
    collectionId?: string;
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

  const { data: pinnedCollections } = useQuery({
    ...convexQuery(
      api.collection.queries.listPinned,
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

  const pinnedResourceItems = pinnedResources ?? [];
  const pinnedCollectionItems = pinnedCollections ?? [];
  const hasPinned =
    pinnedResourceItems.length > 0 || pinnedCollectionItems.length > 0;

  return (
    <SidebarContent
      className={cn(
        sidebarOpen ? "px-2" : "pl-2",
        "w-full overflow-hidden pt-1"
      )}
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
        {params?.workspaceId && hasPinned && (
          <PinnedSection
            activeCollectionId={params.collectionId}
            activeResourceId={params.resourceId}
            collections={pinnedCollectionItems}
            resources={pinnedResourceItems}
            sidebarOpen={sidebarOpen}
            workspaceId={params.workspaceId}
          />
        )}
      </TooltipProvider>
    </SidebarContent>
  );
}

function PinnedSection({
  activeCollectionId,
  activeResourceId,
  collections,
  resources,
  sidebarOpen,
  workspaceId,
}: {
  activeCollectionId?: string;
  activeResourceId?: string;
  collections: PinnedCollection[];
  resources: PinnedResource[];
  sidebarOpen: boolean;
  workspaceId: string;
}) {
  const [collapsed, setCollapsed] = useState(false);

  const items = (
    <div className="flex w-full flex-col gap-1 px-0.5 py-0.5">
      {collections.map((collection) => (
        <PinnedCollectionSidebarItem
          activeCollectionId={activeCollectionId}
          collection={collection}
          key={collection._id}
          sidebarOpen={sidebarOpen}
          workspaceId={workspaceId}
        />
      ))}
      {resources.map((resource) => (
        <PinnedSidebarItem
          activeResourceId={activeResourceId}
          key={resource._id}
          resource={resource}
          sidebarOpen={sidebarOpen}
          workspaceId={workspaceId}
        />
      ))}
    </div>
  );

  if (!sidebarOpen) {
    return (
      <div className="-mx-0.5 mt-2 flex min-h-0 flex-1 flex-col">
        <ScrollArea
          className="h-full min-h-0 flex-1 **:data-[slot=scroll-area-scrollbar]:hidden"
          scrollFade
        >
          {items}
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="mt-3 flex min-h-0 flex-1 flex-col">
      <button
        className="flex items-center gap-1"
        onClick={() => setCollapsed((c) => !c)}
        type="button"
      >
        <motion.div
          animate={{ rotate: collapsed ? 0 : 90 }}
          initial={false}
          transition={{ duration: 0.15, ease: "easeOut" }}
        >
          <RiArrowRightSFill className="size-3.5 text-ui-fg-muted" />
        </motion.div>
        <RiPushpinFill className="size-3 shrink-0 text-ui-fg-muted" />
        <span className="font-medium text-ui-fg-muted text-xs">Pinned</span>
      </button>
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            animate={{ opacity: 1 }}
            className="mt-1 flex min-h-0 flex-1 flex-col"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            <ScrollArea
              className="h-full min-h-0 flex-1 **:data-[slot=scroll-area-scrollbar]:hidden"
              scrollFade
            >
              {items}
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PinnedSidebarItem({
  activeResourceId,
  resource,
  sidebarOpen,
  workspaceId,
}: {
  activeResourceId?: string;
  resource: PinnedResource;
  sidebarOpen: boolean;
  workspaceId: string;
}) {
  const navigate = useNavigate();
  const wsId = workspaceId as Id<"workspace">;

  const { mutate: togglePin } = useMutation({
    mutationFn: useConvexMutation(api.resource.mutations.togglePin),
  });
  const { mutate: removeMany } = useMutation({
    mutationFn: useConvexMutation(api.resource.mutations.removeMany),
  });
  const { mutate: restoreMany } = useMutation({
    mutationFn: useConvexMutation(api.resource.mutations.restoreMany),
  });

  const website = "website" in resource ? resource.website : null;
  const file = "file" in resource ? resource.file : null;
  const fileUrl = "fileUrl" in resource ? resource.fileUrl : null;

  const handleUnpin = useCallback(() => {
    togglePin({ resourceId: resource._id, workspaceId: wsId });
  }, [togglePin, resource._id, wsId]);

  const handleOpenInBrowser = useCallback(() => {
    if (website?.url) {
      window.open(website.url, "_blank", "noopener");
    }
  }, [website?.url]);

  const handleCopyUrl = useCallback(() => {
    if (website?.url) {
      navigator.clipboard.writeText(website.url);
    }
  }, [website?.url]);

  const handleDownload = useCallback(() => {
    if (!fileUrl) {
      return;
    }
    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = file?.fileName ?? "download";
    a.click();
  }, [fileUrl, file?.fileName]);

  const handleDelete = useCallback(() => {
    removeMany({ workspaceId: wsId, resourceIds: [resource._id] });
    const { nextUrl } = closeResourceTabs(wsId, [resource._id]);
    if (nextUrl) {
      navigate({ to: nextUrl });
    }
    toastManager.add({
      type: "success",
      title: "Deleted",
      actionProps: {
        children: "Undo",
        onClick: () => {
          restoreMany({ workspaceId: wsId, resourceIds: [resource._id] });
        },
      },
    });
  }, [removeMany, restoreMany, navigate, wsId, resource._id]);

  const link = (
    <SidebarLinkItem
      iconNode={<ResourceIcon resource={resource} />}
      isActive={activeResourceId === resource._id}
      preload="render"
      sidebarOpen={sidebarOpen}
      title={resource.title || "Untitled"}
      url={`/workspace/${workspaceId}/resource/${resource._id}`}
    />
  );

  return (
    <ContextMenu>
      <ContextMenu.Trigger render={<div />}>{link}</ContextMenu.Trigger>
      <ContextMenu.Content className="z-[110]!">
        <ContextMenu.Item onClick={handleUnpin}>
          <RiUnpinFill />
          Unpin
        </ContextMenu.Item>
        {resource.type === "website" && website?.url && (
          <>
            <ContextMenu.Separator />
            <ContextMenu.Item onClick={handleOpenInBrowser}>
              <RiExternalLinkFill />
              Open in browser
            </ContextMenu.Item>
            <ContextMenu.Item onClick={handleCopyUrl}>
              <RiFileCopyFill />
              Copy URL
            </ContextMenu.Item>
          </>
        )}
        {resource.type === "file" && fileUrl && (
          <>
            <ContextMenu.Separator />
            <ContextMenu.Item onClick={handleDownload}>
              <RiDownloadFill />
              Download
            </ContextMenu.Item>
          </>
        )}
        <ContextMenu.Separator />
        <ContextMenu.Item className="text-ui-fg-error" onClick={handleDelete}>
          <RiDeleteBinFill className="text-ui-fg-error! group-hover/menuitem:text-ui-fg-base!" />
          Delete
        </ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu>
  );
}

function PinnedCollectionSidebarItem({
  activeCollectionId,
  collection,
  sidebarOpen,
  workspaceId,
}: {
  activeCollectionId?: string;
  collection: PinnedCollection;
  sidebarOpen: boolean;
  workspaceId: string;
}) {
  const wsId = workspaceId as Id<"workspace">;

  const { mutate: togglePin } = useMutation({
    mutationFn: useConvexMutation(api.collection.mutations.togglePin),
  });
  const { mutate: removeCollection } = useMutation({
    mutationFn: useConvexMutation(api.collection.mutations.remove),
    onError: () => {
      toastManager.add({
        type: "error",
        title: "Could not delete folder",
      });
    },
  });

  const handleUnpin = useCallback(() => {
    togglePin({ collectionId: collection._id, workspaceId: wsId });
  }, [togglePin, collection._id, wsId]);

  const handleDelete = useCallback(() => {
    removeCollection({ collectionId: collection._id, workspaceId: wsId });
  }, [removeCollection, collection._id, wsId]);

  const link = (
    <SidebarLinkItem
      iconNode={
        <CollectionIcon
          icon={collection.icon ?? undefined}
          iconColor={collection.iconColor ?? undefined}
          size="xs"
        />
      }
      isActive={activeCollectionId === collection._id}
      preload="render"
      sidebarOpen={sidebarOpen}
      title={collection.name || "Untitled"}
      url={`/workspace/${workspaceId}/library/collection/${collection._id}`}
    />
  );

  return (
    <ContextMenu>
      <ContextMenu.Trigger render={<div />}>{link}</ContextMenu.Trigger>
      <ContextMenu.Content className="z-[110]!">
        <ContextMenu.Item onClick={handleUnpin}>
          <RiUnpinFill />
          Unpin
        </ContextMenu.Item>
        <ContextMenu.Separator />
        <ContextMenu.Item className="text-ui-fg-error" onClick={handleDelete}>
          <RiDeleteBinFill className="text-ui-fg-error! group-hover/menuitem:text-ui-fg-base!" />
          Delete
        </ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu>
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
        className="size-3.5"
        fileName={file?.fileName}
        mimeType={file?.mimeType}
      />
    );
  }

  return null;
}
