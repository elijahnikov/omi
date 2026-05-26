import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { api } from "@omi/backend/_generated/api.js";
import type { Id } from "@omi/backend/_generated/dataModel.js";
import { Skeleton } from "@omi/ui/skeleton";
import { toastManager } from "@omi/ui/toast";
import { RiChatSmile2Fill } from "@remixicon/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { UIMessage } from "ai";
import { useCallback, useEffect, useRef, useState } from "react";
import { DotGridLoader } from "~/components/common/dot-grid-loader";
import { EmptyState } from "~/components/common/empty-state";
import { NotFoundState } from "~/components/common/not-found-state";
import { TextShimmer } from "~/components/common/text-shimmer";
import { useLibraryChat } from "~/hooks/use-library-chat";
import { useElementOffset } from "~/lib/use-element-offset";
import { ChatInput } from "./chat-input";
import { MessageBubble } from "./message-bubble";

const TOOL_LABELS: Record<string, string> = {
  searchLibrary: "Searching library...",
  getResourceDetails: "Reading resource...",
  proposeCollection: "Building collection proposal...",
};

function StreamingIndicator({ messages }: { messages: UIMessage[] }) {
  const lastMessage = messages.at(-1);

  if (lastMessage?.role === "assistant") {
    const toolPart = lastMessage.parts.find(
      (p) =>
        p.type.startsWith("tool-") &&
        "state" in p &&
        p.state !== "output-available"
    );
    if (toolPart && "toolCallId" in toolPart) {
      const toolName = toolPart.type.replace("tool-", "");
      const label = TOOL_LABELS[toolName] ?? "Using tool...";
      return (
        <div className="ml-4 flex items-center gap-2">
          <DotGridLoader />
          <TextShimmer className="ml-2 text-[13px]">{label}</TextShimmer>
        </div>
      );
    }

    const hasText = lastMessage.parts.some(
      (p) => p.type === "text" && "text" in p && (p.text as string).length > 0
    );
    if (hasText) {
      return null;
    }
  }

  return (
    <div className="ml-4 flex items-center gap-2">
      <DotGridLoader />
      <TextShimmer className="ml-2 text-[13px]">Thinking...</TextShimmer>
    </div>
  );
}

function convertToUIMessages(
  messages: Array<{
    _id: string;
    role: "user" | "assistant";
    content: string;
    createdAt: number;
    toolParts?: unknown[];
  }>
): UIMessage[] {
  return messages.map((m) => {
    const persistedToolParts = (m.toolParts ?? []) as UIMessage["parts"];
    const parts: UIMessage["parts"] = [
      { type: "text" as const, text: m.content },
      ...persistedToolParts,
    ];

    return {
      id: m._id,
      role: m.role,
      parts,
      createdAt: new Date(m.createdAt),
    };
  });
}

export function ChatArea({
  workspaceId,
  threadId,
  resourceId,
  onThreadCreated,
  initialValue,
  autoSend,
}: {
  workspaceId: Id<"workspace">;
  threadId?: Id<"chatThread">;
  resourceId?: Id<"resource">;
  onThreadCreated?: (threadId: Id<"chatThread">) => void;
  initialValue?: string;
  autoSend?: boolean;
}) {
  const { mutateAsync: createThread } = useMutation({
    mutationFn: useConvexMutation(api.chat.mutations.createThread),
  });

  const { data: thread, isLoading: isLoadingThread } = useQuery(
    convexQuery(
      api.chat.queries.getThread,
      threadId ? { threadId, workspaceId } : "skip"
    )
  );

  const { messages, sendMessage, setMessages, status, stop } = useLibraryChat({
    workspaceId,
    threadId,
    resourceId,
    onError: (error) => {
      if (error.message.includes("insufficient_credits")) {
        toastManager.add({
          type: "error",
          title: "You're out of AI actions",
          description:
            "Upgrade your plan at /settings?tab=billing to keep chatting.",
        });
        return;
      }
      toastManager.add({
        type: "error",
        title: "Chat failed",
        description: error.message,
      });
    },
  });

  const hasSyncedRef = useRef(false);
  const prevThreadIdRef = useRef(threadId);

  if (prevThreadIdRef.current !== threadId) {
    prevThreadIdRef.current = threadId;
    hasSyncedRef.current = false;
  }

  useEffect(() => {
    if (thread?.messages?.length && !hasSyncedRef.current) {
      hasSyncedRef.current = true;
      setMessages(convertToUIMessages(thread.messages));
    }
  }, [thread?.messages, setMessages]);

  const [scrollEl, setScrollEl] = useState<HTMLDivElement | null>(null);
  const [virtualParentEl, setVirtualParentEl] =
    useState<HTMLDivElement | null>(null);
  const scrollMargin = useElementOffset(virtualParentEl, scrollEl);

  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => scrollEl,
    estimateSize: () => 80,
    overscan: 5,
    anchorTo: "end",
    followOnAppend: true,
    scrollEndThreshold: 100,
    scrollMargin,
    measureElement: (el) => el.getBoundingClientRect().height,
  });

  const isStreaming = status === "streaming" || status === "submitted";

  const handleSend = useCallback(
    async (content: string, _mentions: unknown[]) => {
      let currentThreadId = threadId;
      if (!currentThreadId) {
        currentThreadId = await createThread({ workspaceId, resourceId });
        onThreadCreated?.(currentThreadId);
      }
      sendMessage({ text: content }, { body: { threadId: currentThreadId } });
    },
    [
      threadId,
      createThread,
      workspaceId,
      resourceId,
      onThreadCreated,
      sendMessage,
    ]
  );

  const autoSendFiredRef = useRef(false);
  useEffect(() => {
    if (autoSend && initialValue && !(threadId || autoSendFiredRef.current)) {
      autoSendFiredRef.current = true;
      handleSend(initialValue, []);
    }
  }, [autoSend, initialValue, threadId, handleSend]);

  if (threadId && !isLoadingThread && !thread) {
    return <NotFoundState />;
  }

  if (threadId && isLoadingThread) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-8">
            <div className="flex flex-row-reverse gap-3">
              <Skeleton className="size-7 shrink-0 rounded-full" />
              <Skeleton className="h-10 w-48 rounded-xl" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="size-7 shrink-0 rounded-full" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-72 rounded-xl" />
                <Skeleton className="h-4 w-56 rounded-xl" />
                <Skeleton className="h-4 w-64 rounded-xl" />
              </div>
            </div>
            <div className="flex flex-row-reverse gap-3">
              <Skeleton className="size-7 shrink-0 rounded-full" />
              <Skeleton className="h-10 w-36 rounded-xl" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="size-7 shrink-0 rounded-full" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-64 rounded-xl" />
                <Skeleton className="h-4 w-80 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
        <ChatInput
          initialValue={initialValue}
          isStreaming={false}
          onSend={handleSend}
          onStop={stop}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto" ref={setScrollEl}>
        <div className="mx-auto flex w-full min-w-0 max-w-2xl flex-col px-4 py-8">
          {messages.length === 0 && (
            <EmptyState
              description="Ask questions about your saved resources."
              Icon={RiChatSmile2Fill}
              title="Ask your library"
            />
          )}
          {messages.length > 0 && (
            <div
              ref={setVirtualParentEl}
              style={{
                position: "relative",
                height: virtualizer.getTotalSize(),
                width: "100%",
              }}
            >
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const message = messages[virtualRow.index];
                if (!message) {
                  return null;
                }
                const isLast = virtualRow.index === messages.length - 1;
                const hasText = message.parts.some(
                  (p) =>
                    p.type === "text" &&
                    "text" in p &&
                    (p.text as string).length > 0
                );
                if (
                  isLast &&
                  isStreaming &&
                  message.role === "assistant" &&
                  !hasText
                ) {
                  return null;
                }
                return (
                  <div
                    data-index={virtualRow.index}
                    key={message.id}
                    ref={virtualizer.measureElement}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      transform: `translateY(${virtualRow.start - scrollMargin}px)`,
                      paddingBottom: 16,
                    }}
                  >
                    <MessageBubble
                      isStreaming={isStreaming && isLast}
                      message={message}
                      threadId={threadId}
                      workspaceId={workspaceId}
                    />
                  </div>
                );
              })}
            </div>
          )}
          {isStreaming && <StreamingIndicator messages={messages} />}
        </div>
      </div>
      <ChatInput
        initialValue={initialValue}
        isStreaming={isStreaming}
        onSend={handleSend}
        onStop={stop}
      />
    </div>
  );
}
