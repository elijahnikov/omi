import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { api } from "@omi/backend/_generated/api.js";
import type { Id } from "@omi/backend/_generated/dataModel.js";
import { Badge } from "@omi/ui/badge";
import { Button } from "@omi/ui/button";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPopup,
  DialogTitle,
} from "@omi/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@omi/ui/dropdown-menu";
import { Heading } from "@omi/ui/heading";
import { Text } from "@omi/ui/text";
import { toastManager } from "@omi/ui/toast";
import {
  RiDeleteBinFill,
  RiExternalLinkFill,
  RiLogoutBoxFill,
  RiMoreFill,
} from "@remixicon/react";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { ConvexError } from "convex/values";
import { useState } from "react";
import { CreateWorkspaceForm } from "~/components/common/create-workspace-dialog";
import { WorkspaceIcon } from "~/components/common/workspace-icon/workspace-icon";

type Role = "owner" | "admin" | "member";

const ROLE_LABELS: Record<Role, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
};

function getErrorMessage(error: unknown): string {
  if (error instanceof ConvexError) {
    return typeof error.data === "string" ? error.data : "An error occurred";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An error occurred";
}

export function WorkspacesTab() {
  return (
    <div className="flex flex-col gap-6">
      <div className="mb-2">
        <Heading>Workspaces</Heading>
        <Text className="text-ui-fg-subtle" size="small">
          Create new workspaces and manage the ones you belong to
        </Text>
      </div>

      <div className="flex flex-col gap-3">
        <Heading className="text-sm" level="h3">
          Create new
        </Heading>
        <CreateWorkspaceForm />
      </div>

      <div className="mt-3 space-y-2">
        <Heading className="text-sm" level="h3">
          Your workspaces
        </Heading>
        <WorkspacesList />
      </div>
    </div>
  );
}

function WorkspacesList() {
  const { data: workspaces } = useSuspenseQuery(
    convexQuery(api.workspace.queries.listByUser, {})
  );

  if (workspaces.length === 0) {
    return null;
  }

  const ownedCount = workspaces.filter((w) => w.role === "owner").length;

  return (
    <div className="flex flex-col gap-1">
      {workspaces.map((workspace) => (
        <WorkspaceRow
          isLastOwned={workspace.role === "owner" && ownedCount === 1}
          key={workspace._id}
          workspace={workspace}
        />
      ))}
    </div>
  );
}

interface WorkspaceRowProps {
  isLastOwned: boolean;
  workspace: {
    _id: Id<"workspace">;
    name: string;
    role: Role;
    emoji?: string;
    icon?: string;
    iconColor?: string;
  };
}

function WorkspaceRow({ workspace, isLastOwned }: WorkspaceRowProps) {
  const navigate = useNavigate();
  const [confirmAction, setConfirmAction] = useState<"leave" | "delete" | null>(
    null
  );

  const { mutate: leaveWorkspace } = useMutation({
    mutationFn: useConvexMutation(api.workspace.mutations.leaveWorkspace),
    onError: (err) => {
      toastManager.add({
        type: "error",
        title: "Could not leave workspace",
        description: getErrorMessage(err),
      });
    },
  });

  const { mutate: deleteWorkspace } = useMutation({
    mutationFn: useConvexMutation(api.workspace.mutations.deleteWorkspace),
    onError: (err) => {
      toastManager.add({
        type: "error",
        title: "Could not delete workspace",
        description: getErrorMessage(err),
      });
    },
  });

  const handleOpen = () =>
    navigate({
      to: "/workspace/$workspaceId",
      params: { workspaceId: workspace._id },
    });

  const handleConfirm = () => {
    if (confirmAction === "leave") {
      leaveWorkspace({ workspaceId: workspace._id });
    } else if (confirmAction === "delete") {
      deleteWorkspace({ workspaceId: workspace._id });
    }
    setConfirmAction(null);
  };

  const isOwner = workspace.role === "owner";

  return (
    <div className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-ui-bg-subtle">
      <div className="flex items-center gap-3">
        <WorkspaceIcon
          emoji={workspace.emoji}
          icon={workspace.icon}
          iconColor={workspace.iconColor}
          size="md"
        />
        <Text>{workspace.name}</Text>
      </div>
      <div className="flex items-center gap-2">
        <Badge size="default" variant="mono">
          {ROLE_LABELS[workspace.role]}
        </Badge>
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex size-7 items-center justify-center rounded-md hover:bg-ui-bg-subtle-hover"
            render={<button type="button" />}
          >
            <RiMoreFill className="size-4 text-ui-fg-muted" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={4}>
            <DropdownMenuItem onClick={handleOpen}>
              <RiExternalLinkFill className="size-4" />
              Open
            </DropdownMenuItem>
            {!isOwner && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => setConfirmAction("leave")}
                >
                  <RiLogoutBoxFill className="size-4" />
                  Leave workspace
                </DropdownMenuItem>
              </>
            )}
            {isOwner && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  disabled={isLastOwned}
                  onClick={() => setConfirmAction("delete")}
                >
                  <RiDeleteBinFill className="size-4" />
                  Delete workspace
                  {isLastOwned && (
                    <span className="ml-auto text-[10px] text-ui-fg-muted">
                      Last workspace
                    </span>
                  )}
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog
        onOpenChange={(open) => {
          if (!open) {
            setConfirmAction(null);
          }
        }}
        open={confirmAction !== null}
      >
        <DialogPopup>
          <DialogHeader>
            <DialogTitle>
              {confirmAction === "leave"
                ? "Leave workspace"
                : "Delete workspace"}
            </DialogTitle>
          </DialogHeader>
          <div className="p-6">
            <DialogDescription>
              {confirmAction === "leave" ? (
                <>
                  Leave <span className="font-medium">{workspace.name}</span>?
                  You'll lose access to all resources in this workspace.
                </>
              ) : (
                <>
                  Permanently delete{" "}
                  <span className="font-medium">{workspace.name}</span> and all
                  of its resources, collections, and tags? This cannot be
                  undone.
                </>
              )}
            </DialogDescription>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="secondary" />}>
              Cancel
            </DialogClose>
            <Button onClick={handleConfirm} variant="destructive">
              {confirmAction === "leave" ? "Leave" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogPopup>
      </Dialog>
    </div>
  );
}
