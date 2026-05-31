import { useConvexMutation } from "@convex-dev/react-query";
import { api } from "@omi/backend/_generated/api.js";
import type { Id } from "@omi/backend/_generated/dataModel.js";
import {
  Dialog,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@omi/ui/dialog";
import { Input } from "@omi/ui/input";
import { LoadingButton } from "@omi/ui/loading-button";
import { toastManager } from "@omi/ui/toast";
import { RiAddFill } from "@remixicon/react";
import { useMutation } from "@tanstack/react-query";
import { ConvexError } from "convex/values";
import { useState } from "react";
import {
  WorkspaceIcon,
  WorkspaceIconSelector,
} from "~/components/common/workspace-icon";

type IconState =
  | { type: "icon"; name: string; color: string }
  | { type: "emoji"; emoji: string }
  | { type: "none" };

function getErrorMessage(error: unknown): string {
  if (error instanceof ConvexError) {
    return typeof error.data === "string" ? error.data : "An error occurred";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An error occurred";
}

export function CreateWorkspaceForm({
  onSuccess,
}: {
  onSuccess?: (workspaceId: Id<"workspace">) => void;
}) {
  const [name, setName] = useState("");
  const [iconState, setIconState] = useState<IconState>({ type: "none" });
  const [error, setError] = useState<string | null>(null);

  const { mutate: createWorkspace, isPending } = useMutation({
    mutationFn: useConvexMutation(api.workspace.mutations.create),
    onSuccess: (workspaceId) => {
      setName("");
      setIconState({ type: "none" });
      setError(null);
      toastManager.add({
        type: "success",
        title: "Workspace created",
      });
      onSuccess?.(workspaceId as Id<"workspace">);
    },
    onError: (err) => {
      setError(getErrorMessage(err));
    },
    meta: { customErrorToast: true },
  });

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }
    createWorkspace({
      name: trimmed,
      emoji: iconState.type === "emoji" ? iconState.emoji : undefined,
      icon: iconState.type === "icon" ? iconState.name : undefined,
      iconColor: iconState.type === "icon" ? iconState.color : undefined,
    });
  };

  return (
    <form className="flex items-center gap-2" onSubmit={handleSubmit}>
      <WorkspaceIconSelector
        currentEmoji={iconState.type === "emoji" ? iconState.emoji : undefined}
        currentIcon={iconState.type === "icon" ? iconState.name : undefined}
        currentIconColor={
          iconState.type === "icon" ? iconState.color : undefined
        }
        onSelect={(value) => setIconState(value)}
      >
        <div className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md border border-dashed hover:bg-ui-bg-component">
          <WorkspaceIcon
            emoji={iconState.type === "emoji" ? iconState.emoji : undefined}
            icon={iconState.type === "icon" ? iconState.name : undefined}
            iconColor={iconState.type === "icon" ? iconState.color : undefined}
            size="md"
          />
        </div>
      </WorkspaceIconSelector>
      <div className="flex-1">
        <Input
          onChange={(e) => {
            setName(e.target.value);
            setError(null);
          }}
          placeholder="Workspace name"
          value={name}
        />
        {error && <p className="mt-1 text-destructive text-xs">{error}</p>}
      </div>
      <LoadingButton
        disabled={!name.trim()}
        loading={isPending}
        type="submit"
        variant="omi"
      >
        <RiAddFill className="size-3 shrink-0" />
        Create
      </LoadingButton>
    </form>
  );
}

export function CreateWorkspaceDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (workspaceId: Id<"workspace">) => void;
}) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogPopup className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-medium text-sm">
            Create workspace
          </DialogTitle>
        </DialogHeader>
        <DialogPanel>
          <CreateWorkspaceForm
            onSuccess={(workspaceId) => {
              onOpenChange(false);
              onCreated?.(workspaceId);
            }}
          />
        </DialogPanel>
      </DialogPopup>
    </Dialog>
  );
}
