import {
  useConvexMutation,
  useConvexPaginatedQuery,
} from "@convex-dev/react-query";
import { api } from "@omi/backend/_generated/api.js";
import type { Id } from "@omi/backend/_generated/dataModel.js";
import { cn } from "@omi/ui";
import { Button } from "@omi/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@omi/ui/dropdown-menu";
import { ScrollArea } from "@omi/ui/scroll-area";
import { Skeleton } from "@omi/ui/skeleton";
import { Text } from "@omi/ui/text";
import { toastManager } from "@omi/ui/toast";
import {
  RiAddLine,
  RiChatSmile2Fill,
  RiDeleteBinFill,
  RiMoreFill,
  RiPencilFill,
} from "@remixicon/react";
import { useMutation } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ConvexError } from "convex/values";
import { useCallback, useState } from "react";
import { EditableText } from "~/components/common/editable-text";
import { EmptyState } from "~/components/common/empty-state";
import { TextShimmer } from "~/components/common/text-shimmer";
import { useElementOffset } from "~/lib/use-element-offset";
import { useScrollAncestor } from "~/lib/use-scroll-ancestor";

const ROW_HEIGHT = 36;

function getErrorMessage(error: unknown): string {
  if (error instanceof ConvexError) {
    return typeof error.data === "string" ? error.data : "An error occurred";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An error occurred";
}

function ThreadListSkeleton() {
  return (
    <div className="flex flex-col gap-2 p-2">
      {Array.from({ length: 17 }).map((_, i) => (
        <Skeleton className="h-8 w-full rounded-md" key={i} />
      ))}
    </div>
  );
}

export function ThreadList({
  workspaceId,
  activeThreadId,
  onNewChat,
  className,
}: {
  workspaceId: Id<"workspace">;
  activeThreadId?: Id<"chatThread">;
  onNewChat: () => void;
  className?: string;
}) {
  const { results: threads, status } = useConvexPaginatedQuery(
    api.chat.queries.listThreads,
    { workspaceId },
    { initialNumItems: 50 }
  );

  const { mutate: updateTitle } = useMutation({
    mutationFn: useConvexMutation(api.chat.mutations.updateThreadTitle),
    onError: (err) => {
      toastManager.add({
        type: "error",
        title: "Could not rename thread",
        description: getErrorMessage(err),
      });
    },
  });

  const { mutate: deleteThread } = useMutation({
    mutationFn: useConvexMutation(api.chat.mutations.deleteThread),
    onError: (err) => {
      toastManager.add({
        type: "error",
        title: "Could not delete thread",
        description: getErrorMessage(err),
      });
    },
  });

  const handleUpdateTitle = useCallback(
    (threadId: Id<"chatThread">, title: string) => {
      updateTitle({ threadId, title, workspaceId });
    },
    [updateTitle, workspaceId]
  );

  const handleDelete = useCallback(
    (threadId: Id<"chatThread">) => {
      deleteThread({ threadId, workspaceId });
      if (activeThreadId === threadId) {
        onNewChat();
      }
    },
    [deleteThread, workspaceId, activeThreadId, onNewChat]
  );

  const isFirstLoad = status === "LoadingFirstPage" && threads.length === 0;

  const [parentEl, setParentEl] = useState<HTMLDivElement | null>(null);
  const scrollEl = useScrollAncestor(parentEl);
  const scrollMargin = useElementOffset(parentEl, scrollEl);

  const virtualizer = useVirtualizer({
    count: threads.length,
    getScrollElement: () => scrollEl,
    estimateSize: () => ROW_HEIGHT,
    overscan: 8,
    scrollMargin,
    measureElement: (el) => el.getBoundingClientRect().height,
  });

  return (
    <div
      className={cn(
        "relative flex h-full w-full flex-col border-r-[0.5px] md:w-64 md:shrink-0",
        className
      )}
    >
      <div className="flex items-center justify-between py-2 pl-2">
        <Button
          className="mr-2"
          onClick={onNewChat}
          size="small"
          variant="outline"
        >
          New chat
          <RiAddLine className="size-4 shrink-0" />
        </Button>
      </div>
      <ScrollArea className="[&>div>div[style]]:overflow-y-auto! flex-1 [&_::-webkit-scrollbar]:hidden">
        {isFirstLoad ? (
          <ThreadListSkeleton />
        ) : threads.length === 0 ? (
          <EmptyState
            className="px-3 py-8"
            description="Start a new chat to see it here."
            Icon={RiChatSmile2Fill}
            title="No conversations yet"
          />
        ) : (
          <div className="p-2">
            <div
              ref={setParentEl}
              style={{
                position: "relative",
                height: virtualizer.getTotalSize(),
                width: "100%",
              }}
            >
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const thread = threads[virtualRow.index];
                if (!thread) {
                  return null;
                }
                return (
                  <div
                    data-index={virtualRow.index}
                    key={thread._id}
                    ref={virtualizer.measureElement}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      transform: `translateY(${virtualRow.start - scrollMargin}px)`,
                      paddingBottom: 6,
                    }}
                  >
                    <ThreadItem
                      activeThreadId={activeThreadId}
                      onDelete={handleDelete}
                      onUpdateTitle={handleUpdateTitle}
                      thread={thread}
                      workspaceId={workspaceId}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

function ThreadItem({
  thread,
  activeThreadId,
  workspaceId,
  onUpdateTitle,
  onDelete,
}: {
  thread: { _id: Id<"chatThread">; title?: string; lastMessageAt: number };
  activeThreadId?: Id<"chatThread">;
  workspaceId: Id<"workspace">;
  onUpdateTitle: (threadId: Id<"chatThread">, title: string) => void;
  onDelete: (threadId: Id<"chatThread">) => void;
}) {
  const [isRenaming, setIsRenaming] = useState(false);

  return (
    <Link
      key={thread._id}
      params={{
        workspaceId: workspaceId as string,
        threadId: thread._id as string,
      }}
      preload="intent"
      to="/workspace/$workspaceId/chat/$threadId"
    >
      <div
        className={cn(
          "group relative flex items-center rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted",
          activeThreadId === thread._id && "bg-muted"
        )}
      >
        <div className="min-w-0 flex-1">
          {thread.title ? (
            isRenaming ? (
              <EditableText
                autoEdit
                className="font-medium text-[13px] text-ui-fg-base"
                onCancel={() => setIsRenaming(false)}
                onSave={(title) => {
                  onUpdateTitle(thread._id, title);
                  setIsRenaming(false);
                }}
                value={thread.title}
              />
            ) : (
              <Text className="line-clamp-1 font-medium" size="small">
                {thread.title}
              </Text>
            )
          ) : (
            <TextShimmer className="text-[13px]">
              Generating title...
            </TextShimmer>
          )}
        </div>
        <div className="absolute right-1 z-20 opacity-0 transition-opacity group-hover:opacity-100">
          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex h-6 w-6 items-center justify-center rounded-md text-ui-fg-muted transition-colors hover:bg-ui-bg-base hover:text-ui-fg-base"
              onClick={(e) => e.preventDefault()}
            >
              <RiMoreFill className="h-3.5 w-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={4}>
              <DropdownMenuItem
                disabled={!thread.title}
                onClick={(e) => {
                  e.preventDefault();
                  setIsRenaming(true);
                }}
              >
                <RiPencilFill className="h-4 w-4" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-ui-fg-error"
                onClick={(e) => {
                  e.preventDefault();
                  onDelete(thread._id);
                }}
              >
                <RiDeleteBinFill className="h-4 w-4 text-ui-fg-error!" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Link>
  );
}
