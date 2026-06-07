import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { api } from "@omi/backend/_generated/api.js";
import type { Id } from "@omi/backend/_generated/dataModel.js";
import { Badge } from "@omi/ui/badge";
import { Button } from "@omi/ui/button";
import { Heading } from "@omi/ui/heading";
import { LoadingButton } from "@omi/ui/loading-button";
import { Text } from "@omi/ui/text";
import { toastManager } from "@omi/ui/toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { INTEGRATION_CATALOG } from "~/lib/integration-catalog";
import { userSettingsSearch } from "~/lib/user-settings-nav";
import { AddIntegrationDialog } from "./add-integration-dialog";
import {
  BindingConfigDialog,
  type WorkspaceBinding,
} from "./binding-config-dialog";
import { IntegrationLogo } from "./integration-logo";

const SYNC_PROVIDERS = new Set(["github", "linear", "notion"]);

export function IntegrationsTab({
  workspaceId,
}: {
  workspaceId: Id<"workspace">;
}) {
  const { data: bindings = [] } = useQuery(
    convexQuery(api.connections.bindings.queries.listBindingsForWorkspace, {
      workspaceId,
    })
  );
  const { data: connections = [] } = useQuery(
    convexQuery(api.connections.queries.listMyConnections, {})
  );

  const [addOpen, setAddOpen] = useState(false);
  const [configBinding, setConfigBinding] = useState<WorkspaceBinding | null>(
    null
  );

  const syncCatalog = INTEGRATION_CATALOG.filter(
    (entry) =>
      entry.connection && SYNC_PROVIDERS.has(entry.connection.providerId)
  );

  return (
    <div className="flex w-full flex-col gap-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Heading>Integrations</Heading>
          <Text className="text-ui-fg-subtle" size="small">
            Connect third-party accounts and choose what syncs into this
            workspace.
          </Text>
        </div>
        <Button onClick={() => setAddOpen(true)} size="small" variant="omi">
          Add sync
        </Button>
      </div>

      {bindings.length === 0 ? (
        <div className="rounded-lg border border-dashed px-4 py-8 text-center">
          <Text className="text-ui-fg-subtle" size="small">
            No continuous sync configured for this workspace yet.
          </Text>
          <div className="mt-3">
            <Button
              onClick={() => setAddOpen(true)}
              size="small"
              variant="secondary"
            >
              Add integration
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {bindings.map((binding) => (
            <BindingRow
              binding={binding}
              key={binding._id}
              onConfigure={() => setConfigBinding(binding)}
              workspaceId={workspaceId}
            />
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Text className="font-medium" size="small">
          Available for sync
        </Text>
        <Text className="text-ui-fg-muted" size="xsmall">
          One-time imports are in the{" "}
          <Link
            className="text-ui-fg-base underline"
            params={{ workspaceId }}
            search={{ tab: "import" }}
            to="/workspace/$workspaceId/settings"
          >
            Import
          </Link>{" "}
          tab. OAuth accounts are managed in{" "}
          <Link
            className="text-ui-fg-base underline"
            search={userSettingsSearch({ workspaceId })}
            to="/settings"
          >
            Connected accounts
          </Link>
          .
        </Text>
        <div className="flex flex-wrap gap-2 pt-1">
          {syncCatalog.map((entry) => (
            <Badge key={entry.id} size="sm" variant="mono">
              {entry.label}
            </Badge>
          ))}
        </div>
      </div>

      <AddIntegrationDialog
        connections={connections}
        onOpenChange={setAddOpen}
        open={addOpen}
        syncCatalog={syncCatalog}
        workspaceId={workspaceId}
      />

      <BindingConfigDialog
        binding={configBinding}
        onOpenChange={(next) => {
          if (!next) {
            setConfigBinding(null);
          }
        }}
        open={configBinding !== null}
        workspaceId={workspaceId}
      />
    </div>
  );
}

function BindingRow({
  binding,
  workspaceId,
  onConfigure,
}: {
  binding: WorkspaceBinding;
  workspaceId: Id<"workspace">;
  onConfigure: () => void;
}) {
  const remove = useMutation({
    mutationFn: useConvexMutation(
      api.connections.bindings.mutations.removeSyncBinding
    ),
    onSuccess: () =>
      toastManager.add({ type: "success", title: "Sync removed" }),
    onError: (err) =>
      toastManager.add({
        type: "error",
        title: "Could not remove sync",
        description: err instanceof Error ? err.message : "Unknown error",
      }),
  });

  const entry = INTEGRATION_CATALOG.find(
    (item) => item.connection?.providerId === binding.provider
  );
  const isActive = binding.syncEnabled && !binding.syncPaused;

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg p-4 transition-colors hover:bg-ui-bg-component-hover dark:hover:bg-ui-bg-component">
      <div className="flex min-w-0 items-start gap-3">
        <IntegrationLogo entry={entry} provider={binding.provider} />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Text className="font-medium">
              {entry?.label ?? binding.provider}
            </Text>
            <Badge size="sm" variant={isActive ? "mono" : "warning"}>
              {isActive ? "Sync on" : "Paused"}
            </Badge>
          </div>
          <Text className="text-ui-fg-muted" size="xsmall">
            {binding.providerAccountLabel ?? "Connected account"}
          </Text>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button onClick={onConfigure} size="small" variant="secondary">
          Configure
        </Button>
        <LoadingButton
          loading={remove.isPending}
          onClick={() => remove.mutate({ workspaceId, bindingId: binding._id })}
          size="small"
          variant="secondary"
        >
          Remove
        </LoadingButton>
      </div>
    </div>
  );
}
