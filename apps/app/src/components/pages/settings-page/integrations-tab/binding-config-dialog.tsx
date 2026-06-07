import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { api } from "@omi/backend/_generated/api.js";
import type { Id } from "@omi/backend/_generated/dataModel.js";
import { Badge } from "@omi/ui/badge";
import { Button } from "@omi/ui/button";
import {
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogPopup,
  DialogTitle,
} from "@omi/ui/dialog";
import { LoadingButton } from "@omi/ui/loading-button";
import { Text } from "@omi/ui/text";
import { toastManager } from "@omi/ui/toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { GithubScopeEditor } from "~/components/pages/user-settings-page/integrations/providers/github-config";
import { LinearScopeEditor } from "~/components/pages/user-settings-page/integrations/providers/linear-config";
import {
  DestinationPicker,
  toErrorMessage,
} from "~/components/pages/user-settings-page/integrations/shared";

export interface WorkspaceBinding {
  _id: Id<"connectionSyncBinding">;
  connectionId: Id<"connection">;
  connectionStatus: string;
  destinationCollectionId?: Id<"collection">;
  lastSyncedAt?: number;
  provider: string;
  providerAccountLabel?: string;
  scopeSelection?: unknown;
  syncEnabled: boolean;
  syncPaused?: boolean;
  workspaceId: Id<"workspace">;
}

function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) {
    return "just now";
  }
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  return `${Math.floor(hours / 24)}d ago`;
}

const PROVIDER_LABEL: Record<string, string> = {
  notion: "Notion",
  github: "GitHub",
  linear: "Linear",
};

export function BindingConfigDialog({
  binding,
  workspaceId,
  open,
  onOpenChange,
}: {
  binding: WorkspaceBinding | null;
  workspaceId: Id<"workspace">;
  open: boolean;
  onOpenChange: (next: boolean) => void;
}) {
  const { data: billing, isPending: billingPending } = useQuery(
    convexQuery(api.billing.queries.getMyBillingState, {})
  );

  if (!binding) {
    return null;
  }

  const isPro = billing?.plan === "pro";
  const isActive = binding.syncEnabled && !binding.syncPaused;

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogPopup className="max-w-xl!">
        <DialogHeader>
          <DialogTitle className="font-medium text-sm">
            {PROVIDER_LABEL[binding.provider] ?? binding.provider} sync
          </DialogTitle>
        </DialogHeader>
        <div className="flex max-h-[70vh] flex-col gap-8 overflow-y-auto px-6 py-4">
          {billingPending ? (
            <div className="h-24" />
          ) : isPro ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Badge size="sm" variant={isActive ? "mono" : "warning"}>
                    {isActive ? "Sync on" : "Paused"}
                  </Badge>
                  <Text className="text-ui-fg-subtle" size="small">
                    {binding.lastSyncedAt
                      ? `Last synced ${formatRelativeTime(binding.lastSyncedAt)}`
                      : "Not yet synced"}
                  </Text>
                </div>
                <SyncControls
                  binding={binding}
                  isActive={isActive}
                  workspaceId={workspaceId}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Text className="font-medium" size="small">
                  Account
                </Text>
                <Text className="text-ui-fg-subtle" size="small">
                  {binding.providerAccountLabel ?? "Connected account"}
                </Text>
              </div>

              <div className="flex flex-col gap-2">
                <Text className="font-medium" size="small">
                  Destination
                </Text>
                <DestinationPickerWrapper
                  binding={binding}
                  workspaceId={workspaceId}
                />
              </div>

              {binding.provider === "github" ? (
                <GithubScopeEditor
                  bindingId={binding._id}
                  connectionId={binding.connectionId}
                  initialScope={
                    binding.scopeSelection as {
                      repos?: Array<{ name: string }>;
                      starsEnabled?: boolean;
                    }
                  }
                  onClose={() => onOpenChange(false)}
                  workspaceId={workspaceId}
                />
              ) : null}
              {binding.provider === "linear" ? (
                <LinearScopeEditor
                  bindingId={binding._id}
                  connectionId={binding.connectionId}
                  initialScope={
                    binding.scopeSelection as {
                      teams?: Array<{ id: string; name: string }>;
                    }
                  }
                  onClose={() => onOpenChange(false)}
                  workspaceId={workspaceId}
                />
              ) : null}
            </>
          ) : (
            <Text className="text-ui-fg-subtle" size="small">
              Continuous sync requires a Pro plan.
            </Text>
          )}
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="secondary">
            Close
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}

function SyncControls({
  binding,
  workspaceId,
  isActive,
}: {
  binding: WorkspaceBinding;
  workspaceId: Id<"workspace">;
  isActive: boolean;
}) {
  const triggerNow = useMutation({
    mutationFn: useConvexMutation(
      api.connections.bindings.mutations.triggerSyncNow
    ),
    onSuccess: () =>
      toastManager.add({ type: "success", title: "Sync queued" }),
    onError: (err) =>
      toastManager.add({
        type: "error",
        title: "Could not trigger sync",
        description: toErrorMessage(err),
      }),
  });

  const setPaused = useMutation({
    mutationFn: useConvexMutation(
      api.connections.bindings.mutations.setSyncPaused
    ),
    onError: (err) =>
      toastManager.add({
        type: "error",
        title: "Could not update sync",
        description: toErrorMessage(err),
      }),
  });

  return (
    <div className="flex items-center gap-2">
      <LoadingButton
        disabled={!isActive}
        loading={triggerNow.isPending}
        onClick={() =>
          triggerNow.mutate({ workspaceId, bindingId: binding._id })
        }
        size="small"
        variant="secondary"
      >
        Sync now
      </LoadingButton>
      <LoadingButton
        loading={setPaused.isPending}
        onClick={() =>
          setPaused.mutate({
            workspaceId,
            bindingId: binding._id,
            paused: isActive,
          })
        }
        size="small"
        variant="secondary"
      >
        {isActive ? "Pause" : "Resume"}
      </LoadingButton>
    </div>
  );
}

function DestinationPickerWrapper({
  binding,
  workspaceId,
}: {
  binding: WorkspaceBinding;
  workspaceId: Id<"workspace">;
}) {
  const setDestination = useMutation({
    mutationFn: useConvexMutation(
      api.connections.bindings.mutations.setDestinationCollection
    ),
    onSuccess: () =>
      toastManager.add({ type: "success", title: "Destination updated" }),
    onError: (err) =>
      toastManager.add({
        type: "error",
        title: "Could not update destination",
        description: toErrorMessage(err),
      }),
  });

  return (
    <DestinationPicker
      onChange={(next) => {
        setDestination.mutate({
          workspaceId,
          bindingId: binding._id,
          destinationCollectionId: next,
        });
      }}
      value={binding.destinationCollectionId}
      workspaceId={workspaceId}
    />
  );
}
