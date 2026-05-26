import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { api } from "@omi/backend/_generated/api.js";
import type { Id } from "@omi/backend/_generated/dataModel.js";
import { cn } from "@omi/ui";
import { Skeleton } from "@omi/ui/skeleton";
import { Text } from "@omi/ui/text";
import { toastManager } from "@omi/ui/toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { FunctionReturnType } from "convex/server";
import { memo, useCallback, useMemo, useState } from "react";
import { SelectionDock } from "~/components/common/selection-dock";
import {
  type ListNavItem,
  useListNavigation,
} from "~/lib/hotkeys/use-list-navigation";
import { useVirtualizedNavScroll } from "~/lib/hotkeys/use-virtualized-nav-scroll";
import {
  type SelectionItem,
  useSelectAllHotkey,
} from "~/lib/selection/library-selection";
import { useElementOffset } from "~/lib/use-element-offset";
import { useScrollAncestor } from "~/lib/use-scroll-ancestor";
import { closeResourceTabs } from "~/lib/workspace-tabs-store";
import { ResourceRow } from "../library-page/resource-row";
import { SelectableRow } from "../library-page/selectable-resource-row";
import { SearchEmpty } from "./search-empty";

type HybridSearch = FunctionReturnType<typeof api.search.actions.hybridSearch>;
export type SearchResultItem = HybridSearch["results"][number];

const ROW_HEIGHT = 80;

export function SearchResults({
  workspaceId,
  results,
  isLoading,
  isStaleInput,
  query,
  hasActiveFilters,
  stats,
}: {
  workspaceId: Id<"workspace">;
  results: SearchResultItem[] | undefined;
  isLoading: boolean;
  isStaleInput: boolean;
  query: string;
  hasActiveFilters: boolean;
  stats?: {
    titleHits: number;
    semanticHits: number;
    chunkHits: number;
    conceptHits: number;
    tagHits: number;
    totalCandidates: number;
  };
  usedFallback: boolean;
}) {
  const { data: serverPinned } = useQuery(
    convexQuery(api.resource.queries.listPinned, { workspaceId })
  );
  const pinnedIdSet = useMemo(
    () => new Set((serverPinned ?? []).map((r) => r._id)),
    [serverPinned]
  );

  const { mutate: updateTitle } = useMutation({
    mutationFn: useConvexMutation(api.resource.mutations.updateTitle),
  });
  const { mutate: togglePin } = useMutation({
    mutationFn: useConvexMutation(api.resource.mutations.togglePin),
  });
  const { mutate: removeMany } = useMutation({
    mutationFn: useConvexMutation(api.resource.mutations.removeMany),
  });
  const { mutate: restoreMany } = useMutation({
    mutationFn: useConvexMutation(api.resource.mutations.restoreMany),
  });

  const handleUpdateTitle = useCallback(
    (resourceId: Id<"resource">, title: string) => {
      updateTitle({ resourceId, title, workspaceId });
    },
    [updateTitle, workspaceId]
  );
  const handleTogglePin = useCallback(
    (resourceId: Id<"resource">) => {
      togglePin({ resourceId, workspaceId });
    },
    [togglePin, workspaceId]
  );
  const navigate = useNavigate();

  const handleDelete = useCallback(
    (resourceId: Id<"resource">) => {
      removeMany({ workspaceId, resourceIds: [resourceId] });
      const { nextUrl } = closeResourceTabs(workspaceId, [resourceId]);
      if (nextUrl) {
        navigate({ to: nextUrl });
      }
      toastManager.add({
        type: "success",
        title: "Deleted",
        actionProps: {
          children: "Undo",
          onClick: () => {
            restoreMany({ workspaceId, resourceIds: [resourceId] });
          },
        },
      });
    },
    [removeMany, restoreMany, workspaceId, navigate]
  );

  const orderedItems = useMemo<SelectionItem[]>(
    () =>
      (results ?? []).map((r) => ({
        kind: "resource" as const,
        id: r.resourceId,
      })),
    [results]
  );

  const navItems = useMemo<ListNavItem[]>(
    () =>
      (results ?? []).map((r) => ({
        id: `res-${r.resourceId}`,
        open: () =>
          navigate({
            to: "/workspace/$workspaceId/resource/$resourceId",
            params: { workspaceId, resourceId: r.resourceId },
          }),
      })),
    [results, navigate, workspaceId]
  );

  const { activeId } = useListNavigation(navItems);

  useSelectAllHotkey(orderedItems);

  const [parentEl, setParentEl] = useState<HTMLDivElement | null>(null);
  const scrollEl = useScrollAncestor(parentEl);
  const scrollMargin = useElementOffset(parentEl, scrollEl);

  const virtualizer = useVirtualizer({
    count: results?.length ?? 0,
    getScrollElement: () => scrollEl,
    estimateSize: () => ROW_HEIGHT,
    overscan: 5,
    scrollMargin,
    measureElement: (el) => el.getBoundingClientRect().height,
  });

  const idIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    const list = results ?? [];
    for (let i = 0; i < list.length; i++) {
      const r = list[i];
      if (r) {
        map.set(`res-${r.resourceId}`, i);
      }
    }
    return map;
  }, [results]);

  const getIndexForId = useCallback(
    (id: string) => idIndexMap.get(id) ?? null,
    [idIndexMap]
  );

  useVirtualizedNavScroll({
    virtualizer,
    activeId,
    getIndexForId,
    fallbackScrollEl: scrollEl,
  });

  const showSkeleton =
    (isLoading || isStaleInput) && (results?.length ?? 0) === 0;

  if (showSkeleton) {
    return (
      <div className="flex flex-col gap-y-2 pt-2">
        <div className="px-1 pb-1">
          <Skeleton className="h-3 w-20" />
        </div>
        {Array.from({ length: 11 }).map((_, i) => (
          <Skeleton className="h-13 w-full" key={i.toString()} />
        ))}
      </div>
    );
  }

  if (results && results.length === 0) {
    return <SearchEmpty hasActiveFilters={hasActiveFilters} query={query} />;
  }

  if (!results) {
    return null;
  }

  return (
    <div className="flex flex-col pt-2">
      {stats ? (
        <div className="flex items-center gap-x-2 px-1 pb-1 text-[11px] text-ui-fg-muted">
          <Text className="font-medium font-mono text-[11px]">
            {results.length} result{results.length === 1 ? "" : "s"}
          </Text>
        </div>
      ) : null}
      <div
        ref={setParentEl}
        style={{
          position: "relative",
          height: virtualizer.getTotalSize(),
          width: "100%",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const result = results[virtualRow.index];
          if (!result) {
            return null;
          }
          const navId = `res-${result.resourceId}`;
          const isActive = activeId === navId;
          return (
            <div
              data-index={virtualRow.index}
              key={result.resourceId}
              ref={virtualizer.measureElement}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start - scrollMargin}px)`,
                paddingBottom: 4,
              }}
            >
              <SelectableRow
                item={{ kind: "resource", id: result.resourceId }}
                orderedItems={orderedItems}
              >
                <div
                  className={cn(
                    "rounded-lg",
                    isActive && "ring-2 ring-ui-fg-interactive ring-inset"
                  )}
                  data-nav-active={isActive || undefined}
                >
                  <MemoizedRow
                    isPinned={pinnedIdSet.has(result.resourceId)}
                    onDelete={handleDelete}
                    onTogglePin={handleTogglePin}
                    onUpdateTitle={handleUpdateTitle}
                    result={result}
                    workspaceId={workspaceId}
                  />
                </div>
              </SelectableRow>
            </div>
          );
        })}
      </div>
      <SelectionDock workspaceId={workspaceId} />
    </div>
  );
}

const MemoizedRow = memo(function MemoizedRow({
  result,
  workspaceId,
  isPinned,
  onUpdateTitle,
  onTogglePin,
  onDelete,
}: {
  result: SearchResultItem;
  workspaceId: Id<"workspace">;
  isPinned: boolean;
  onUpdateTitle: (id: Id<"resource">, title: string) => void;
  onTogglePin: (id: Id<"resource">) => void;
  onDelete: (id: Id<"resource">) => void;
}) {
  return (
    <ResourceRow
      isPinned={isPinned}
      onDelete={onDelete}
      onTogglePin={onTogglePin}
      onUpdateTitle={onUpdateTitle}
      resource={
        result.resource as Parameters<typeof ResourceRow>[0]["resource"]
      }
      snippet={result.bestSnippet ?? undefined}
      workspaceId={workspaceId}
    />
  );
});
