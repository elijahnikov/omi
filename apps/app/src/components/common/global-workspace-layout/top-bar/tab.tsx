import { cn } from "@omi/ui";
import { ContextMenu } from "@omi/ui/context-menu";
import { toastManager } from "@omi/ui/toast";
import {
  RiArrowRightUpLine,
  RiCloseLine,
  RiDeleteBin6Line,
  RiFileCopyLine,
  RiLinkM,
  RiPushpinFill,
  RiUnpinLine,
} from "@remixicon/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { type MouseEvent, memo, useCallback } from "react";
import { TabIcon } from "~/components/common/global-workspace-layout/top-bar/tab-icon";
import {
  useWorkspaceTabs,
  type WorkspaceTab,
} from "~/lib/workspace-tabs-store";

interface TabProps {
  isActive: boolean;
  tab: WorkspaceTab;
  workspaceId: string;
}

function TabComponent({ tab, isActive, workspaceId }: TabProps) {
  const closeTab = useWorkspaceTabs((s) => s.closeTab);
  const closeOthers = useWorkspaceTabs((s) => s.closeOthers);
  const closeToRight = useWorkspaceTabs((s) => s.closeToRight);
  const closeAll = useWorkspaceTabs((s) => s.closeAll);
  const pinTab = useWorkspaceTabs((s) => s.pinTab);
  const duplicateTab = useWorkspaceTabs((s) => s.duplicateTab);
  const navigate = useNavigate();

  const handleClose = useCallback(
    (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const { nextUrl, wasActive } = closeTab(workspaceId, tab.id);
      if (wasActive && nextUrl) {
        navigate({ to: nextUrl });
      }
    },
    [closeTab, navigate, tab.id, workspaceId]
  );

  const handleMouseDown = useCallback(
    (event: MouseEvent) => {
      if (event.button === 1) {
        event.preventDefault();
        handleClose(event);
      }
    },
    [handleClose]
  );

  const handleOpen = useCallback(() => {
    navigate({ to: tab.url });
  }, [navigate, tab.url]);

  const handleCloseFromMenu = useCallback(() => {
    const { nextUrl, wasActive } = closeTab(workspaceId, tab.id);
    if (wasActive && nextUrl) {
      navigate({ to: nextUrl });
    }
  }, [closeTab, navigate, tab.id, workspaceId]);

  const handleCloseOthers = useCallback(() => {
    const { nextUrl } = closeOthers(workspaceId, tab.id);
    if (nextUrl) {
      navigate({ to: nextUrl });
    }
  }, [closeOthers, navigate, tab.id, workspaceId]);

  const handleCloseToRight = useCallback(() => {
    const { nextUrl } = closeToRight(workspaceId, tab.id);
    if (nextUrl) {
      navigate({ to: nextUrl });
    }
  }, [closeToRight, navigate, tab.id, workspaceId]);

  const handleCloseAll = useCallback(() => {
    const { nextUrl } = closeAll(workspaceId);
    if (nextUrl) {
      navigate({ to: nextUrl });
    }
  }, [closeAll, navigate, workspaceId]);

  const handleTogglePin = useCallback(() => {
    pinTab(workspaceId, tab.id);
  }, [pinTab, tab.id, workspaceId]);

  const handleDuplicate = useCallback(() => {
    const result = duplicateTab(workspaceId, tab.id);
    if (result) {
      navigate({ to: tab.url });
    }
  }, [duplicateTab, navigate, tab.id, tab.url, workspaceId]);

  const handleCopyUrl = useCallback(() => {
    const origin = typeof window === "undefined" ? "" : window.location.origin;
    const fullUrl = `${origin}${tab.url}`;
    navigator.clipboard
      .writeText(fullUrl)
      .then(() => {
        toastManager.add({ type: "success", title: "URL copied to clipboard" });
      })
      .catch(() => {
        toastManager.add({ type: "error", title: "Failed to copy URL" });
      });
  }, [tab.url]);

  return (
    <ContextMenu>
      <ContextMenu.Trigger
        render={
          <div
            className={cn(
              "group/tab relative mb-1.5 flex h-7 shrink-0 items-end",
              isActive && "sticky right-1 left-1 z-[2]"
            )}
            data-active={isActive || undefined}
          />
        }
      >
        <Link
          className={cn(
            "relative mb-0.25 flex h-6.5 items-center justify-center gap-1.5 rounded-sm px-2 font-medium! outline-none transition-colors md:min-w-[120px] md:max-w-[220px] md:justify-start",
            isActive
              ? "z-[100] bg-ui-bg-base text-ui-fg-base shadow-borders-base"
              : "text-ui-fg-muted hover:bg-[rgba(0,0,0,0.070)] hover:text-ui-fg-base dark:hover:bg-[rgba(255,255,255,0.070)]"
          )}
          onMouseDown={handleMouseDown}
          preload="intent"
          preloadDelay={100}
          to={tab.url}
        >
          {tab.pinned && (
            <RiPushpinFill className="size-3 shrink-0 text-ui-fg-muted" />
          )}
          <span className="flex size-3.5 shrink-0 items-center justify-center text-ui-fg-muted [&>*]:shrink-0">
            <TabIcon tab={tab} workspaceId={workspaceId} />
          </span>
          <span className="hidden truncate text-xs! md:inline">
            {tab.title}
          </span>
          <button
            aria-label={`Close ${tab.title}`}
            className="ml-auto hidden size-3 shrink-0 items-center justify-center rounded-full text-ui-fg-muted hover:bg-black/8 hover:text-ui-fg-base md:flex dark:hover:bg-white/10"
            onClick={handleClose}
            type="button"
          >
            <RiCloseLine className="size-3" />
          </button>
        </Link>
      </ContextMenu.Trigger>
      <ContextMenu.Content className="z-[110]!">
        <ContextMenu.Item onClick={handleOpen}>
          <RiArrowRightUpLine />
          Open
        </ContextMenu.Item>
        <ContextMenu.Item onClick={handleDuplicate}>
          <RiFileCopyLine />
          Duplicate tab
        </ContextMenu.Item>
        <ContextMenu.Item onClick={handleTogglePin}>
          {tab.pinned ? <RiUnpinLine /> : <RiPushpinFill />}
          {tab.pinned ? "Unpin tab" : "Pin tab"}
        </ContextMenu.Item>
        <ContextMenu.Item onClick={handleCopyUrl}>
          <RiLinkM />
          Copy URL
        </ContextMenu.Item>
        <ContextMenu.Separator />
        <ContextMenu.Item onClick={handleCloseFromMenu}>
          <RiCloseLine />
          Close
        </ContextMenu.Item>
        <ContextMenu.Item onClick={handleCloseOthers}>
          <RiCloseLine />
          Close others
        </ContextMenu.Item>
        <ContextMenu.Item onClick={handleCloseToRight}>
          <RiCloseLine />
          Close to the right
        </ContextMenu.Item>
        <ContextMenu.Separator />
        <ContextMenu.Item onClick={handleCloseAll} variant="destructive">
          <RiDeleteBin6Line />
          Close all
        </ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu>
  );
}

export const Tab = memo(TabComponent);
