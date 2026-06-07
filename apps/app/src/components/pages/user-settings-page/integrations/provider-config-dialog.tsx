import { useConvexMutation } from "@convex-dev/react-query";
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
import { useMutation } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { toErrorMessage } from "./shared";

export type ProviderId = "notion" | "github" | "linear";

export interface ConfigConnection {
  _id: Id<"connection">;
  provider: ProviderId;
  providerAccountLabel?: string;
  status: "active" | "expired" | "error" | "paused" | "revoked";
  syncBindings?: Array<{
    _id: Id<"connectionSyncBinding">;
    workspaceId: Id<"workspace">;
    syncEnabled: boolean;
    syncPaused?: boolean;
  }>;
}

const PROVIDER_LABEL: Record<ProviderId, string> = {
  notion: "Notion",
  github: "GitHub",
  linear: "Linear",
};

export function ProviderConfigDialog({
  connection,
  onOpenChange,
  onReconnect,
  open,
}: {
  connection: ConfigConnection | null;
  onOpenChange: (next: boolean) => void;
  onReconnect: (provider: ProviderId) => void;
  open: boolean;
}) {
  if (!connection) {
    return null;
  }

  const activeBindings =
    connection.syncBindings?.filter((b) => b.syncEnabled) ?? [];

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogPopup className="max-w-md!">
        <DialogHeader>
          <DialogTitle className="font-medium text-sm">
            {PROVIDER_LABEL[connection.provider]} account
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-6 px-6 py-4">
          <div className="flex items-center justify-between">
            <Text className="text-ui-fg-subtle" size="small">
              {connection.providerAccountLabel ?? "Connected account"}
            </Text>
            <Badge
              size="sm"
              variant={
                connection.status === "active"
                  ? "mono"
                  : connection.status === "error"
                    ? "destructive"
                    : "warning"
              }
            >
              {connection.status === "active" ? "Connected" : connection.status}
            </Badge>
          </div>

          {activeBindings.length > 0 ? (
            <div className="flex flex-col gap-2">
              <Text className="font-medium" size="small">
                Syncing to
              </Text>
              {activeBindings.map((binding) => (
                <Link
                  className="text-sm text-ui-fg-subtle underline"
                  key={binding._id}
                  params={{ workspaceId: binding.workspaceId }}
                  search={{ tab: "integrations" }}
                  to="/workspace/$workspaceId/settings"
                >
                  Workspace sync settings
                </Link>
              ))}
            </div>
          ) : (
            <Text className="text-ui-fg-muted" size="xsmall">
              Configure what syncs where from each workspace&apos;s Integrations
              settings.
            </Text>
          )}
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              onReconnect(connection.provider);
              onOpenChange(false);
            }}
            variant="secondary"
          >
            Reconnect
          </Button>
          <DisconnectButton
            connectionId={connection._id}
            onDone={() => onOpenChange(false)}
          />
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}

function DisconnectButton({
  connectionId,
  onDone,
}: {
  connectionId: Id<"connection">;
  onDone: () => void;
}) {
  const { mutate, isPending } = useMutation({
    mutationFn: useConvexMutation(api.connections.mutations.disconnect),
    onSuccess: () => {
      toastManager.add({ type: "success", title: "Disconnected" });
      onDone();
    },
    onError: (err) => {
      toastManager.add({
        type: "error",
        title: "Could not disconnect",
        description: toErrorMessage(err),
      });
    },
  });
  return (
    <LoadingButton
      loading={isPending}
      onClick={() => mutate({ connectionId })}
      variant="secondary"
    >
      Disconnect
    </LoadingButton>
  );
}
