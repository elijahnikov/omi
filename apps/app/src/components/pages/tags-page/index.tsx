import { api } from "@omi/backend/_generated/api.js";
import type { Id } from "@omi/backend/_generated/dataModel.js";
import { cn } from "@omi/ui";
import { Badge } from "@omi/ui/badge";
import { Skeleton } from "@omi/ui/skeleton";
import { Text } from "@omi/ui/text";
import { RiHashtag } from "@remixicon/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useInView } from "react-intersection-observer";
import { EmptyState } from "~/components/common/empty-state";
import { PageContent } from "~/components/common/page-content";
import {
  type ListNavItem,
  useListNavigation,
} from "~/lib/hotkeys/use-list-navigation";
import { useVirtualizedNavScroll } from "~/lib/hotkeys/use-virtualized-nav-scroll";
import { useCachedPaginatedQuery } from "~/lib/use-cached-paginated-query";
import { useElementOffset } from "~/lib/use-element-offset";
import { useScrollAncestor } from "~/lib/use-scroll-ancestor";
import { TagsToolbar, useTagsFilters } from "./tags-toolbar";

const PAGE_SIZE = 30;
const ROW_HEIGHT = 44;

export function TagsPageComponent({
  workspaceId,
}: {
  workspaceId: Id<"workspace">;
}) {
  const { search, order } = useTagsFilters();

  const { results, status, loadMore } = useCachedPaginatedQuery(
    api.resource.queries.listWorkspaceTags,
    {
      workspaceId,
      search: search || undefined,
      order: order ?? undefined,
    },
    PAGE_SIZE
  );

  const sorted = useMemo(() => {
    if (search) {
      return results;
    }
    if (order === "newest") {
      return [...results].sort((a, b) => b._creationTime - a._creationTime);
    }
    if (order === "oldest") {
      return [...results].sort((a, b) => a._creationTime - b._creationTime);
    }
    if (order === "most_resources") {
      return [...results].sort((a, b) => b.resourceCount - a.resourceCount);
    }
    return [...results].sort((a, b) => a.name.localeCompare(b.name));
  }, [results, order, search]);

  const { ref: loadMoreRef, inView } = useInView();

  useEffect(() => {
    if (inView && status === "CanLoadMore") {
      loadMore(PAGE_SIZE);
    }
  }, [inView, status, loadMore]);

  const isFirstLoad = status === "LoadingFirstPage" && results.length === 0;
  const isEmpty = sorted.length === 0 && !isFirstLoad;

  const navigate = useNavigate();
  const navItems = useMemo<ListNavItem[]>(
    () =>
      sorted.map((tag) => ({
        id: `tag-${tag._id}`,
        open: () =>
          navigate({
            to: "/workspace/$workspaceId/tags/$tagName",
            params: { workspaceId, tagName: tag.name },
          }),
      })),
    [sorted, navigate, workspaceId]
  );
  const { activeId } = useListNavigation(navItems);

  const [parentEl, setParentEl] = useState<HTMLDivElement | null>(null);
  const scrollEl = useScrollAncestor(parentEl);
  const scrollMargin = useElementOffset(parentEl, scrollEl);

  const virtualizer = useVirtualizer({
    count: sorted.length,
    getScrollElement: () => scrollEl,
    estimateSize: () => ROW_HEIGHT,
    overscan: 5,
    scrollMargin,
    measureElement: (el) => el.getBoundingClientRect().height,
  });

  const idIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    for (let i = 0; i < sorted.length; i++) {
      const tag = sorted[i];
      if (tag) {
        map.set(`tag-${tag._id}`, i);
      }
    }
    return map;
  }, [sorted]);

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

  return (
    <div>
      <TagsToolbar />
      <PageContent className="pt-14 pb-4 md:pt-4" width="xl:w-2/3">
        {isFirstLoad ? (
          <TagsListSkeleton />
        ) : isEmpty ? (
          <EmptyState
            description={
              search
                ? "Try a different search."
                : "Tags are created when you add them to resources."
            }
            Icon={RiHashtag}
            title={search ? "No tags found" : "No tags yet"}
          />
        ) : (
          <>
            <div
              ref={setParentEl}
              style={{
                position: "relative",
                height: virtualizer.getTotalSize(),
                width: "100%",
              }}
            >
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const tag = sorted[virtualRow.index];
                if (!tag) {
                  return null;
                }
                const navId = `tag-${tag._id}`;
                const isActive = activeId === navId;
                return (
                  <div
                    data-index={virtualRow.index}
                    key={tag._id}
                    ref={virtualizer.measureElement}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      transform: `translateY(${virtualRow.start - scrollMargin}px)`,
                    }}
                  >
                    <div
                      className={cn(
                        "rounded-lg",
                        isActive && "ring-2 ring-ui-fg-interactive ring-inset"
                      )}
                      data-nav-active={isActive}
                    >
                      <Link
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-ui-bg-base-hover"
                        params={{ workspaceId, tagName: tag.name }}
                        to="/workspace/$workspaceId/tags/$tagName"
                      >
                        <Text className="text-ui-fg-muted">#</Text>
                        <Text className="flex-1 truncate font-medium text-ui-fg-base">
                          {tag.name}
                        </Text>
                        <Badge
                          className="text-[12px]!"
                          size="default"
                          variant={"mono"}
                        >
                          {tag.resourceCount}
                        </Badge>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="h-px" ref={loadMoreRef} />
            {status === "LoadingMore" && <LoadingMoreSkeleton />}
          </>
        )}
      </PageContent>
    </div>
  );
}

function TagsListSkeleton() {
  return (
    <div className="flex flex-col gap-y-2">
      {Array.from({ length: 12 }).map((_, i) => (
        <Skeleton className="h-10 w-full" key={i} />
      ))}
    </div>
  );
}

function LoadingMoreSkeleton() {
  return (
    <div className="flex flex-col gap-y-2 py-2">
      {Array.from({ length: PAGE_SIZE }).map((_, i) => (
        <Skeleton className="h-10 w-full" key={`loading-${i.toString()}`} />
      ))}
    </div>
  );
}
