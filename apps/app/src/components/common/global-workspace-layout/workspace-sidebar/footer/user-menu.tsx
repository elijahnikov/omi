import { convexQuery } from "@convex-dev/react-query";
import { authClient } from "@omi/auth/client";
import { api } from "@omi/backend/_generated/api.js";
import type { Doc, Id } from "@omi/backend/_generated/dataModel.js";
import { cn } from "@omi/ui";
import { Avatar, AvatarFallback, AvatarImage } from "@omi/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@omi/ui/dropdown-menu";
import { Skeleton } from "@omi/ui/skeleton";
import { useTheme } from "@omi/ui/theme";
import {
  RiAddFill,
  RiCheckFill,
  RiComputerFill,
  RiFolderOpenFill,
  RiLogoutBoxFill,
  RiMoonFill,
  RiSettings4Fill,
  RiSunFill,
} from "@remixicon/react";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import type { UseNavigateResult } from "@tanstack/react-router";
import { useNavigate, useParams, useRouter } from "@tanstack/react-router";
import BoringAvatar from "boring-avatars";
import { useState } from "react";
import { CreateWorkspaceDialog } from "~/components/common/create-workspace-dialog";
import { WorkspaceIcon } from "~/components/common/workspace-icon";

type Workspace = Doc<"workspace"> & { role: string };

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: RiSunFill },
  { value: "dark", label: "Dark", icon: RiMoonFill },
  { value: "auto", label: "System", icon: RiComputerFill },
] as const;

function WorkspaceItem({
  workspace,
  isActive,
  onSelect,
}: {
  workspace: Workspace;
  isActive: boolean;
  onSelect: UseNavigateResult<string>;
}) {
  return (
    <DropdownMenuItem
      className={isActive ? "bg-ui-bg-component-hover" : ""}
      onClick={() =>
        onSelect({
          to: "/workspace/$workspaceId",
          params: { workspaceId: workspace._id as Id<"workspace"> },
        })
      }
    >
      <WorkspaceIcon
        className={cn(workspace.emoji && "mr-1 -ml-1")}
        emoji={workspace.emoji}
        icon={workspace.icon}
        iconColor={workspace.iconColor}
        size="xs"
      />
      <span className={cn("truncate", isActive && "text-ui-fg-base")}>
        {workspace.name}
      </span>
    </DropdownMenuItem>
  );
}

function WorkspaceSubMenu({
  onCreateWorkspace,
}: {
  onCreateWorkspace: () => void;
}) {
  const navigate = useNavigate();
  const { workspaceId } = useParams({ strict: false }) as {
    workspaceId?: string;
  };
  const { data: workspaces } = useQuery(
    convexQuery(api.workspace.queries.listByUser, {})
  );

  const _current = workspaces?.find((w) => w._id === workspaceId);
  const owned = workspaces?.filter((w) => w.role === "owner") ?? [];
  const memberOf = workspaces?.filter((w) => w.role !== "owner") ?? [];

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <RiFolderOpenFill />
        <span className="truncate">Workspaces</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="w-56 max-w-56 overflow-x-hidden">
        {owned.length > 0 && (
          <DropdownMenuGroup>
            <DropdownMenuLabel>Your workspaces</DropdownMenuLabel>
            {owned.map((workspace) => (
              <WorkspaceItem
                isActive={workspace._id === workspaceId}
                key={workspace._id}
                onSelect={navigate}
                workspace={workspace}
              />
            ))}
          </DropdownMenuGroup>
        )}
        {owned.length > 0 && memberOf.length > 0 && <DropdownMenuSeparator />}
        {memberOf.length > 0 && (
          <DropdownMenuGroup>
            <DropdownMenuLabel>Shared with you</DropdownMenuLabel>
            <div className="flex flex-col gap-y-2 space-y-2">
              {memberOf.map((workspace) => (
                <WorkspaceItem
                  isActive={workspace._id === workspaceId}
                  key={workspace._id}
                  onSelect={navigate}
                  workspace={workspace}
                />
              ))}
            </div>
          </DropdownMenuGroup>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onCreateWorkspace}>
          <RiAddFill />
          New workspace
        </DropdownMenuItem>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}

function ThemeSubMenu() {
  const { themeMode, setTheme } = useTheme();
  const activeOption =
    THEME_OPTIONS.find((option) => option.value === themeMode) ??
    THEME_OPTIONS[2];
  const ActiveIcon = activeOption.icon;

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <ActiveIcon />
        Theme
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        {THEME_OPTIONS.map(({ value, label, icon: Icon }) => {
          const isActive = themeMode === value;
          return (
            <DropdownMenuItem
              className={isActive ? "bg-ui-bg-component-hover" : ""}
              key={value}
              onClick={() => setTheme(value)}
            >
              <Icon />
              <span className={cn("flex-1", isActive && "text-ui-fg-base")}>
                {label}
              </span>
              {isActive && <RiCheckFill className="ml-2 size-3.5" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}

export function UserMenu() {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const { data } = useSuspenseQuery(
    convexQuery(api.user.queries.currentUser, {})
  );
  const { workspaceId } = useParams({ strict: false }) as {
    workspaceId?: string;
  };
  const { data: workspaceData } = useQuery(
    convexQuery(
      api.workspace.queries.getById,
      workspaceId ? { workspaceId: workspaceId as Id<"workspace"> } : "skip"
    )
  );
  const workspace = workspaceData?.workspace;

  const user = data.user;
  if (!user) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="ml-px flex h-7! w-full items-center gap-x-1 rounded-sm pr-0.5 text-left text-sm hover:bg-accent"
          render={<div />}
        >
          <Avatar className="size-6">
            {user.image && <AvatarImage src={user.image} />}
            <AvatarFallback>
              <BoringAvatar name={user.username} size={28} variant="marble" />
            </AvatarFallback>
          </Avatar>
          {workspace && (
            <div className="flex w-full items-center gap-x-0 rounded-sm bg-ui-bg-base pl-1 shadow-borders-base">
              <WorkspaceIcon
                className={cn(workspace.emoji && "")}
                emoji={workspace.emoji}
                icon={workspace.icon}
                iconColor={workspace.iconColor}
                size="sm"
              />
              <span className="truncate! max-w-18 font-medium text-[13px]">
                {workspace?.name}
              </span>
            </div>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className={"relative"}
          side="bottom"
          sideOffset={6}
        >
          <DropdownMenuItem
            onClick={() =>
              router.navigate({
                to: "/settings",
                search: workspaceId
                  ? { workspaceId: workspaceId as Id<"workspace"> }
                  : undefined,
              })
            }
          >
            <RiSettings4Fill />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <WorkspaceSubMenu onCreateWorkspace={() => setCreateOpen(true)} />
          <ThemeSubMenu />
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={async () => {
              await authClient.signOut();
              router.navigate({ to: "/login" });
            }}
          >
            <RiLogoutBoxFill />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <CreateWorkspaceDialog
        onCreated={(workspaceId) =>
          router.navigate({
            to: "/workspace/$workspaceId",
            params: { workspaceId },
          })
        }
        onOpenChange={setCreateOpen}
        open={createOpen}
      />
    </>
  );
}

export function UserMenuSkeleton() {
  return (
    <div className="flex w-full items-center gap-2 p-1">
      <Skeleton className="size-6 rounded-full" />
      <Skeleton className="h-4 w-20" />
    </div>
  );
}
