import { useConvexAction, useConvexMutation } from "@convex-dev/react-query";
import { api } from "@omi/backend/_generated/api.js";
import type { Id } from "@omi/backend/_generated/dataModel.js";
import { Button } from "@omi/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogPopup,
  DialogTitle,
} from "@omi/ui/dialog";
import { LoadingButton } from "@omi/ui/loading-button";
import { Text } from "@omi/ui/text";
import { toastManager } from "@omi/ui/toast";
import { useMutation } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ConvexError } from "convex/values";
import { useState } from "react";
import { GithubSyncForm } from "~/components/pages/user-settings-page/integrations/providers/github-config";
import { LinearSyncForm } from "~/components/pages/user-settings-page/integrations/providers/linear-config";
import type { IntegrationCatalogEntry } from "~/lib/integration-catalog";
import { userSettingsSearch } from "~/lib/user-settings-nav";
import {
  IntegrationLogo,
  integrationSelectRowClassName,
} from "./integration-logo";

interface ConnectionRow {
  _id: Id<"connection">;
  provider: string;
  providerAccountLabel?: string;
  status: string;
}

export function AddIntegrationDialog({
  open,
  onOpenChange,
  workspaceId,
  syncCatalog,
  connections,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  workspaceId: Id<"workspace">;
  syncCatalog: IntegrationCatalogEntry[];
  connections: ConnectionRow[];
}) {
  const [selectedEntry, setSelectedEntry] =
    useState<IntegrationCatalogEntry | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] =
    useState<Id<"connection"> | null>(null);

  const reset = () => {
    setSelectedEntry(null);
    setSelectedConnectionId(null);
  };

  const handleClose = (next: boolean) => {
    if (!next) {
      reset();
    }
    onOpenChange(next);
  };

  const providerConnections = selectedEntry?.connection
    ? connections.filter(
        (c) =>
          c.provider === selectedEntry.connection?.providerId &&
          c.status !== "revoked"
      )
    : [];

  const selectedConnection = providerConnections.find(
    (c) => c._id === selectedConnectionId
  );

  return (
    <Dialog onOpenChange={handleClose} open={open}>
      <DialogPopup className="max-w-xl!">
        <DialogHeader>
          <DialogTitle className="font-medium text-sm">
            {selectedEntry ? (
              <span className="flex items-center gap-2">
                <IntegrationLogo className="size-4" entry={selectedEntry} />
                Add {selectedEntry.label} sync
              </span>
            ) : (
              "Add sync to workspace"
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="flex max-h-[70vh] flex-col gap-6 overflow-y-auto px-6 py-4">
          {selectedEntry ? (
            selectedConnection ? (
              selectedEntry.connection?.providerId === "github" ? (
                <GithubSyncForm
                  connectionId={selectedConnection._id}
                  onComplete={() => handleClose(false)}
                  workspaceId={workspaceId}
                />
              ) : selectedEntry.connection?.providerId === "linear" ? (
                <LinearSyncForm
                  connectionId={selectedConnection._id}
                  onComplete={() => handleClose(false)}
                  workspaceId={workspaceId}
                />
              ) : (
                <GenericSyncEnable
                  connectionId={selectedConnection._id}
                  onComplete={() => handleClose(false)}
                  workspaceId={workspaceId}
                />
              )
            ) : (
              <>
                <DialogDescription>
                  Choose a connected {selectedEntry.label} account, or connect a
                  new one.
                </DialogDescription>
                {providerConnections.length === 0 ? (
                  <Text className="text-ui-fg-subtle" size="small">
                    No {selectedEntry.label} account connected yet.
                  </Text>
                ) : (
                  <div className="flex flex-col gap-1">
                    {providerConnections.map((connection) => (
                      <button
                        className={integrationSelectRowClassName}
                        key={connection._id}
                        onClick={() => setSelectedConnectionId(connection._id)}
                        type="button"
                      >
                        <IntegrationLogo
                          className="mt-0.5 size-6"
                          entry={selectedEntry}
                        />
                        <div className="min-w-0">
                          <Text className="font-medium" size="small">
                            {connection.providerAccountLabel ??
                              "Connected account"}
                          </Text>
                          <Text className="text-ui-fg-muted" size="xsmall">
                            Use this account for sync in this workspace
                          </Text>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                <OAuthConnectBlock
                  entry={selectedEntry}
                  workspaceId={workspaceId}
                />
                <Button
                  onClick={() => setSelectedEntry(null)}
                  size="small"
                  variant="secondary"
                >
                  Back
                </Button>
              </>
            )
          ) : (
            <>
              <DialogDescription>
                Pick an integration to sync into this workspace.
              </DialogDescription>
              <div className="flex flex-col gap-1">
                {syncCatalog.map((entry) => (
                  <button
                    className={integrationSelectRowClassName}
                    key={entry.id}
                    onClick={() => setSelectedEntry(entry)}
                    type="button"
                  >
                    <IntegrationLogo className="mt-0.5 size-6" entry={entry} />
                    <div className="min-w-0">
                      <Text className="font-medium" size="small">
                        {entry.label}
                      </Text>
                      <Text className="text-ui-fg-muted" size="xsmall">
                        {entry.description}
                      </Text>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </DialogPopup>
    </Dialog>
  );
}

function OAuthConnectBlock({
  entry,
  workspaceId,
}: {
  entry: IntegrationCatalogEntry;
  workspaceId: Id<"workspace">;
}) {
  const { mutate: getAuthorizeUrl, isPending } = useMutation({
    mutationFn: useConvexAction(
      api.connections.oauth.authorize.getAuthorizeUrl
    ),
    onSuccess: (url: string) => {
      window.location.href = url;
    },
    onError: (err) => {
      const message =
        err instanceof ConvexError && typeof err.data === "string"
          ? err.data
          : err instanceof Error
            ? err.message
            : "Unknown error";
      toastManager.add({
        type: "error",
        title: `Could not connect ${entry.label}`,
        description: message,
      });
    },
  });

  if (!entry.connection) {
    return null;
  }

  const { providerId } = entry.connection;

  return (
    <div className="flex flex-col gap-2 rounded-lg border px-4 py-3">
      <Text size="small">Need a different account?</Text>
      <LoadingButton
        loading={isPending}
        onClick={() => {
          const returnTo = `${window.location.origin}/workspace/${workspaceId}/settings?tab=integrations`;
          getAuthorizeUrl({
            provider: providerId,
            returnTo,
            workspaceId,
          });
        }}
        size="small"
        variant="secondary"
      >
        Connect {entry.label}
      </LoadingButton>
      <Text className="text-ui-fg-muted" size="xsmall">
        Or manage accounts in{" "}
        <Link
          className="underline"
          search={userSettingsSearch({ workspaceId })}
          to="/settings"
        >
          Connected accounts
        </Link>
        .
      </Text>
    </div>
  );
}

function GenericSyncEnable({
  connectionId,
  workspaceId,
  onComplete,
}: {
  connectionId: Id<"connection">;
  workspaceId: Id<"workspace">;
  onComplete: () => void;
}) {
  const createBinding = useConvexMutation(
    api.connections.bindings.mutations.createSyncBinding
  );
  const [loading, setLoading] = useState(false);

  return (
    <LoadingButton
      loading={loading}
      onClick={async () => {
        setLoading(true);
        try {
          await createBinding({ workspaceId, connectionId });
          toastManager.add({ type: "success", title: "Sync enabled" });
          onComplete();
        } catch (err) {
          toastManager.add({
            type: "error",
            title: "Could not enable sync",
            description: err instanceof Error ? err.message : "Unknown error",
          });
        } finally {
          setLoading(false);
        }
      }}
      size="small"
      variant="omi"
    >
      Enable sync
    </LoadingButton>
  );
}
