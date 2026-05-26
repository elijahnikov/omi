import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import {
  DndContext,
  DragOverlay,
  type Modifier,
  pointerWithin,
} from "@dnd-kit/core";
import { api } from "@omi/backend/_generated/api.js";
import type { Id } from "@omi/backend/_generated/dataModel.js";
import { cn } from "@omi/ui";
import { Badge } from "@omi/ui/badge";
import { Separator } from "@omi/ui/separator";
import { Skeleton } from "@omi/ui/skeleton";
import { Text } from "@omi/ui/text";
import { toastManager } from "@omi/ui/toast";
import {
  RiArrowRightSFill,
  RiPushpinFill,
  RiStackFill,
} from "@remixicon/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useVirtualizer } from "@tanstack/react-virtual";
import { AnimatePresence, motion } from "motion/react";
import {
  memo,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useInView } from "react-intersection-observer";
import { EmptyState } from "~/components/common/empty-state";
import { SelectionDock } from "~/components/common/selection-dock";
import {
  type ListNavItem,
  useListNavigation,
} from "~/lib/hotkeys/use-list-navigation";
import { useVirtualizedNavScroll } from "~/lib/hotkeys/use-virtualized-nav-scroll";
import { useResourceSections } from "~/lib/resource-sections-store";
import {
  LibrarySelectionProvider,
  type SelectionItem,
  useSelectAllHotkey,
} from "~/lib/selection/library-selection";
import { useCachedPaginatedQuery } from "~/lib/use-cached-paginated-query";
import { useElementOffset } from "~/lib/use-element-offset";
import { useScrollAncestor } from "~/lib/use-scroll-ancestor";
import { closeResourceTabs } from "~/lib/workspace-tabs-store";
import { CollectionRow } from "./collection-row";
import { LibraryDragOverlay } from "./drag-overlay";
import { useLibraryFilters } from "./library-toolbar";
import { ResourceRow, UploadingFileRow } from "./resource-row";
import { SelectableRow } from "./selectable-resource-row";
import { useLibraryDnd } from "./use-library-dnd";

const PAGE_SIZE = 20;
const ROW_HEIGHT = 52;

const snapCenterToCursor: Modifier = ({
  activatorEvent,
  draggingNodeRect,
  transform,
}) => {
  if (!(draggingNodeRect && activatorEvent)) {
    return transform;
  }
  const pointer = activatorEvent as PointerEvent;
  const offsetX =
    pointer.clientX - draggingNodeRect.left - draggingNodeRect.width / 2;
  const offsetY =
    pointer.clientY - draggingNodeRect.top - draggingNodeRect.height / 2;
  return {
    ...transform,
    x: transform.x + offsetX,
    y: transform.y + offsetY,
  };
};

type ListItem =
  | {
      kind: "collection";
      collection: {
        _id: Id<"collection">;
        name: string;
        icon?: string | null;
        _creationTime: number;
      };
    }
  | {
      kind: "resource";
      resource: Parameters<typeof ResourceRow>[0]["resource"];
    };

interface ResourceListProps {
  collectionId?: Id<"collection">;
  header?: ReactNode;
  justCreatedCollectionId?: Id<"collection"> | null;
  onClearBatch: (batchId: string) => void;
  onClearJustCreatedCollection?: () => void;
  onClearPendingCollection?: () => void;
  pendingCollection?: { id: string; name: string } | null;
  uploadingFiles: { id: string; name: string; batchId: string }[];
  workspaceId: Id<"workspace">;
}

export function ResourceList(props: ResourceListProps) {
  return (
    <LibrarySelectionProvider>
      <ResourceListContent {...props} />
    </LibrarySelectionProvider>
  );
}

function ResourceListContent({
  workspaceId,
  uploadingFiles,
  onClearBatch,
  collectionId,
  pendingCollection,
  onClearPendingCollection,
  justCreatedCollectionId,
  onClearJustCreatedCollection,
  header,
}: {
  uploadingFiles: { id: string; name: string; batchId: string }[];
  onClearBatch: (batchId: string) => void;
  workspaceId: Id<"workspace">;
  collectionId?: Id<"collection">;
  pendingCollection?: { id: string; name: string } | null;
  onClearPendingCollection?: () => void;
  justCreatedCollectionId?: Id<"collection"> | null;
  onClearJustCreatedCollection?: () => void;
  header?: ReactNode;
}) {
  const {
    sensors,
    activeItem,
    movingIds,
    clearMovingIds,
    onDragStart,
    onDragEnd,
    onDragCancel,
  } = useLibraryDnd(workspaceId);
  const { search, type, order } = useLibraryFilters();

  const { results, status, loadMore } = useCachedPaginatedQuery(
    api.resource.queries.list,
    {
      workspaceId,
      search: search || undefined,
      type: type ?? undefined,
      order: order ?? undefined,
      collectionId,
    },
    PAGE_SIZE
  );

  const showCollections = !(search || type);
  const { data: childCollections, isLoading: collectionsLoading } = useQuery(
    convexQuery(
      api.collection.queries.listChildren,
      showCollections
        ? {
            workspaceId,
            parentId: collectionId,
          }
        : "skip"
    )
  );

  const showPinned = !collectionId;

  const { data: serverPinned } = useQuery(
    convexQuery(
      api.resource.queries.listPinned,
      showPinned ? { workspaceId } : "skip"
    )
  );

  const pinnedIdSet = useMemo<Set<Id<"resource">>>(
    () =>
      showPinned
        ? new Set((serverPinned ?? []).map((r) => r._id))
        : new Set<Id<"resource">>(),
    [serverPinned, showPinned]
  );

  const uploadingNameSet = useMemo(
    () => new Set(uploadingFiles.map((f) => f.name)),
    [uploadingFiles]
  );

  const batches = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const f of uploadingFiles) {
      const names = map.get(f.batchId) ?? [];
      names.push(f.name);
      map.set(f.batchId, names);
    }
    return map;
  }, [uploadingFiles]);

  const pendingResultTitles = useMemo(() => {
    const set = new Set<string>();
    for (const r of results) {
      const aiStatus = "aiStatus" in r ? r.aiStatus : null;
      if (aiStatus === "pending" || aiStatus === "processing") {
        set.add(r.title);
      }
    }
    return set;
  }, [results]);

  useEffect(() => {
    for (const [batchId, names] of batches) {
      if (names.every((name) => pendingResultTitles.has(name))) {
        onClearBatch(batchId);
      }
    }
  }, [batches, pendingResultTitles, onClearBatch]);

  useEffect(() => {
    if (!(pendingCollection && childCollections)) {
      return;
    }
    const found = childCollections.some(
      (c) => "name" in c && c.name === pendingCollection.name
    );
    if (found) {
      onClearPendingCollection?.();
    }
  }, [childCollections, pendingCollection, onClearPendingCollection]);

  const unpinnedResults = useMemo(
    () =>
      results.filter((r) => {
        if (pinnedIdSet.has(r._id) || movingIds.has(r._id)) {
          return false;
        }
        if (!uploadingNameSet.has(r.title)) {
          return true;
        }
        const aiStatus = "aiStatus" in r ? r.aiStatus : null;
        return aiStatus !== "pending" && aiStatus !== "processing";
      }),
    [results, pinnedIdSet, uploadingNameSet, movingIds]
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

  const { ref: loadMoreRef, inView } = useInView();

  useEffect(() => {
    if (inView && status === "CanLoadMore") {
      loadMore(PAGE_SIZE);
    }
  }, [inView, status, loadMore]);

  useEffect(() => {
    if (status === "CanLoadMore" && unpinnedResults.length < PAGE_SIZE) {
      loadMore(PAGE_SIZE);
    }
  }, [status, unpinnedResults.length, loadMore]);

  const filteredCollections = useMemo(() => {
    const collections = childCollections ?? [];
    return collections.filter((c) => {
      if (movingIds.has(c._id)) {
        return false;
      }
      if (
        pendingCollection &&
        "name" in c &&
        c.name === pendingCollection.name
      ) {
        return false;
      }
      return true;
    });
  }, [childCollections, pendingCollection, movingIds]);

  useEffect(() => {
    if (movingIds.size === 0) {
      return;
    }
    const resultIds = new Set(results.map((r) => r._id));
    const collectionIds = new Set((childCollections ?? []).map((c) => c._id));
    const stale = [...movingIds].filter(
      (id) => !(resultIds.has(id as never) || collectionIds.has(id as never))
    );
    if (stale.length > 0) {
      clearMovingIds(stale);
    }
  }, [results, childCollections, movingIds, clearMovingIds]);

  const mergedList = useMemo((): ListItem[] => {
    const resourceItems: ListItem[] = unpinnedResults.map((r) => ({
      kind: "resource" as const,
      resource: r,
    }));

    if (filteredCollections.length === 0) {
      return resourceItems;
    }

    const collectionItems: ListItem[] = filteredCollections.map((c) => ({
      kind: "collection" as const,
      collection: c,
    }));

    if (order === "alphabetical") {
      const getName = (item: ListItem) =>
        item.kind === "collection" ? item.collection.name : item.resource.title;
      return [...collectionItems, ...resourceItems].sort((a, b) =>
        getName(a).localeCompare(getName(b))
      );
    }

    const getTime = (item: ListItem) =>
      item.kind === "collection"
        ? item.collection._creationTime
        : item.resource._creationTime;

    if (order === "oldest") {
      return [...collectionItems, ...resourceItems].sort(
        (a, b) => getTime(a) - getTime(b)
      );
    }

    return [...collectionItems, ...resourceItems].sort(
      (a, b) => getTime(b) - getTime(a)
    );
  }, [unpinnedResults, filteredCollections, order]);

  const hasPinned = showPinned && serverPinned && serverPinned.length > 0;

  const pinnedSectionId = "library-pinned";
  const explicitPinnedCollapsed = useResourceSections(
    (s) => s.collapsedSections[pinnedSectionId]
  );
  const togglePinnedSection = useResourceSections((s) => s.toggle);
  const pinnedCollapsed =
    explicitPinnedCollapsed ?? (hasPinned && (serverPinned?.length ?? 0) > 5);
  const showPinnedItems = hasPinned && !pinnedCollapsed;
  const isFirstLoad =
    (status === "LoadingFirstPage" && results.length === 0) ||
    (collectionsLoading && !childCollections);
  const isEmpty =
    mergedList.length === 0 && !hasPinned && uploadingFiles.length === 0;

  const navItems = useMemo<ListNavItem[]>(() => {
    const items: ListNavItem[] = [];
    if (showPinnedItems && serverPinned) {
      for (const resource of serverPinned) {
        items.push({
          id: `pinned-${resource._id}`,
          open: () =>
            navigate({
              to: "/workspace/$workspaceId/resource/$resourceId",
              params: { workspaceId, resourceId: resource._id },
            }),
        });
      }
    }
    for (const item of mergedList) {
      if (item.kind === "collection") {
        items.push({
          id: `col-${item.collection._id}`,
          open: () =>
            navigate({
              to: "/workspace/$workspaceId/library/collection/$collectionId",
              params: { workspaceId, collectionId: item.collection._id },
            }),
        });
      } else {
        items.push({
          id: `res-${item.resource._id}`,
          open: () =>
            navigate({
              to: "/workspace/$workspaceId/resource/$resourceId",
              params: { workspaceId, resourceId: item.resource._id },
            }),
        });
      }
    }
    return items;
  }, [showPinnedItems, serverPinned, mergedList, navigate, workspaceId]);

  const { activeId } = useListNavigation(navItems);

  const orderedItems = useMemo<SelectionItem[]>(() => {
    const items: SelectionItem[] = [];
    if (showPinnedItems && serverPinned) {
      for (const r of serverPinned) {
        items.push({ kind: "resource", id: r._id });
      }
    }
    for (const entry of mergedList) {
      if (entry.kind === "collection") {
        items.push({ kind: "collection", id: entry.collection._id });
      } else {
        items.push({ kind: "resource", id: entry.resource._id });
      }
    }
    return items;
  }, [showPinnedItems, serverPinned, mergedList]);

  const [virtualParentEl, setVirtualParentEl] = useState<HTMLDivElement | null>(
    null
  );
  const scrollEl = useScrollAncestor(virtualParentEl);
  const scrollMargin = useElementOffset(virtualParentEl, scrollEl);

  const virtualizer = useVirtualizer({
    count: mergedList.length,
    getScrollElement: () => scrollEl,
    estimateSize: () => ROW_HEIGHT,
    overscan: 20,
    scrollMargin,
    measureElement: (el) => el.getBoundingClientRect().height,
  });

  const mergedIdIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    for (let i = 0; i < mergedList.length; i++) {
      const item = mergedList[i];
      if (!item) {
        continue;
      }
      const id =
        item.kind === "collection"
          ? `col-${item.collection._id}`
          : `res-${item.resource._id}`;
      map.set(id, i);
    }
    return map;
  }, [mergedList]);

  const getIndexForId = useCallback(
    (id: string) => {
      const idx = mergedIdIndexMap.get(id);
      return idx === undefined ? null : idx;
    },
    [mergedIdIndexMap]
  );

  useVirtualizedNavScroll({
    virtualizer,
    activeId,
    getIndexForId,
    fallbackScrollEl: scrollEl,
  });

  const renderBody = () => {
    if (isFirstLoad) {
      return <ResourceListSkeleton />;
    }

    if (isEmpty) {
      if (search || type) {
        return (
          <EmptyState
            description="Try a different search or clear your filter."
            Icon={RiStackFill}
            title="No results found"
          />
        );
      }

      return (
        <EmptyState
          description={
            <>
              Paste a URL, text, or file to get started. Press{" "}
              <Badge size={"sm"} variant={"mono"}>
                Ctrl+V
              </Badge>{" "}
              or{" "}
              <Badge size={"sm"} variant={"mono"}>
                ⌘V
              </Badge>{" "}
              anywhere on this page.
            </>
          }
          Icon={RiStackFill}
          title="No resources yet"
        />
      );
    }

    return null;
  };

  const bodyOverride = renderBody();

  return (
    <>
      {bodyOverride === null && <SelectAllRegister items={orderedItems} />}
      <DndContext
        collisionDetection={pointerWithin}
        onDragCancel={onDragCancel}
        onDragEnd={onDragEnd}
        onDragStart={onDragStart}
        sensors={sensors}
      >
        {header}
        {bodyOverride ?? (
          <div className="flex flex-col">
            {hasPinned && serverPinned && (
              <div className="flex flex-col">
                <button
                  className="ml-4 flex items-center gap-x-1 self-start py-1"
                  onClick={() => togglePinnedSection(pinnedSectionId)}
                  type="button"
                >
                  <motion.div
                    animate={{ rotate: pinnedCollapsed ? 0 : 90 }}
                    initial={false}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                  >
                    <RiArrowRightSFill className="size-3.5 text-ui-fg-muted" />
                  </motion.div>
                  <RiPushpinFill className="size-4 shrink-0 text-ui-fg-muted" />
                  <Text className="font-medium text-sm text-ui-fg-muted">
                    Pinned ({serverPinned.length})
                  </Text>
                </button>
                <AnimatePresence initial={false}>
                  {!pinnedCollapsed && (
                    <motion.div
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      initial={{ height: 0, opacity: 0 }}
                      style={{ overflow: "hidden" }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                      <div className="flex flex-col gap-y-1 pt-1">
                        {serverPinned.map((resource) => {
                          const navId = `pinned-${resource._id}`;
                          return (
                            <SelectableRow
                              item={{ kind: "resource", id: resource._id }}
                              key={resource._id}
                              orderedItems={orderedItems}
                            >
                              <div
                                className={cn(
                                  "rounded-lg",
                                  activeId === navId &&
                                    "ring-2 ring-ui-fg-interactive ring-inset"
                                )}
                                data-nav-active={activeId === navId}
                              >
                                <MemoizedResourceItem
                                  handleDelete={handleDelete}
                                  handleTogglePin={handleTogglePin}
                                  handleUpdateTitle={handleUpdateTitle}
                                  isPinned
                                  resource={resource}
                                  workspaceId={workspaceId}
                                />
                              </div>
                            </SelectableRow>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <Separator className="my-1 h-[0.5px]!" />
              </div>
            )}
            {pendingCollection && (
              <CollectionRow
                autoEdit
                collection={{
                  _id: pendingCollection.id as Id<"collection">,
                  name: pendingCollection.name,
                  _creationTime: Date.now(),
                }}
                workspaceId={workspaceId}
              />
            )}
            {uploadingFiles.map((file) => (
              <UploadingFileRow fileName={file.name} key={file.id} />
            ))}
            <div
              ref={setVirtualParentEl}
              style={{
                position: "relative",
                height: virtualizer.getTotalSize(),
                width: "100%",
              }}
            >
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const item = mergedList[virtualRow.index];
                if (!item) {
                  return null;
                }
                const navId =
                  item.kind === "collection"
                    ? `col-${item.collection._id}`
                    : `res-${item.resource._id}`;
                const isActive = activeId === navId;
                const key =
                  item.kind === "collection"
                    ? `col-${item.collection._id}`
                    : item.resource._id;
                return (
                  <div
                    data-index={virtualRow.index}
                    key={key}
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
                    {item.kind === "collection" ? (
                      <SelectableRow
                        item={{
                          kind: "collection",
                          id: item.collection._id,
                        }}
                        orderedItems={orderedItems}
                      >
                        <div
                          className={cn(
                            "rounded-lg",
                            isActive &&
                              "ring-2 ring-ui-fg-interactive ring-inset"
                          )}
                          data-nav-active={isActive}
                        >
                          <CollectionRow
                            autoEdit={
                              justCreatedCollectionId === item.collection._id
                            }
                            collection={item.collection}
                            onEdited={onClearJustCreatedCollection}
                            workspaceId={workspaceId}
                          />
                        </div>
                      </SelectableRow>
                    ) : (
                      <SelectableRow
                        item={{ kind: "resource", id: item.resource._id }}
                        orderedItems={orderedItems}
                      >
                        <div
                          className={cn(
                            "rounded-lg",
                            isActive &&
                              "ring-2 ring-ui-fg-interactive ring-inset"
                          )}
                          data-nav-active={isActive}
                        >
                          <MemoizedResourceItem
                            handleDelete={handleDelete}
                            handleTogglePin={handleTogglePin}
                            handleUpdateTitle={handleUpdateTitle}
                            isPinned={false}
                            resource={item.resource}
                            workspaceId={workspaceId}
                          />
                        </div>
                      </SelectableRow>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="h-px" ref={loadMoreRef} />
            {status === "LoadingMore" && <LoadingMoreSkeleton />}
          </div>
        )}
        <DragOverlay dropAnimation={null} modifiers={[snapCenterToCursor]}>
          {activeItem ? (
            <LibraryDragOverlay item={activeItem} workspaceId={workspaceId} />
          ) : null}
        </DragOverlay>
      </DndContext>
      {bodyOverride === null && <SelectionDock workspaceId={workspaceId} />}
    </>
  );
}

const MemoizedResourceItem = memo(function ResourceItem({
  resource,
  handleUpdateTitle,
  handleTogglePin,
  handleDelete,
  workspaceId,
  isPinned,
}: {
  handleDelete: (resourceId: Id<"resource">) => void;
  handleTogglePin: (resourceId: Id<"resource">) => void;
  handleUpdateTitle: (resourceId: Id<"resource">, title: string) => void;
  isPinned: boolean;
  resource: Parameters<typeof ResourceRow>[0]["resource"];
  workspaceId: Id<"workspace">;
}) {
  return (
    <ResourceRow
      isPinned={isPinned}
      onDelete={handleDelete}
      onTogglePin={handleTogglePin}
      onUpdateTitle={handleUpdateTitle}
      resource={resource}
      workspaceId={workspaceId}
    />
  );
});

function LoadingMoreSkeleton() {
  return (
    <div className="flex flex-col gap-y-2 py-2">
      {Array.from({ length: PAGE_SIZE }).map((_, i) => (
        <Skeleton className="h-11 w-full" key={`loading-${i.toString()}`} />
      ))}
    </div>
  );
}

function SelectAllRegister({ items }: { items: SelectionItem[] }) {
  useSelectAllHotkey(items);
  return null;
}

export function ResourceListSkeleton({ count = 14 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton className="h-11 w-full" key={i} />
      ))}
    </div>
  );
}
