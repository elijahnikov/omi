import { convexQuery, useConvexAction } from "@convex-dev/react-query";
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
import { Heading } from "@omi/ui/heading";
import { Input } from "@omi/ui/input";
import { LoadingButton } from "@omi/ui/loading-button";
import { Text } from "@omi/ui/text";
import { toastManager } from "@omi/ui/toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ConvexError } from "convex/values";
import { useEffect, useMemo, useState } from "react";
import { INTEGRATION_LOGO } from "~/components/pages/settings-page/import-tab/integration-logos";
import {
  CAPABILITY_LABELS,
  type ConnectionProviderId,
  INTEGRATION_CATALOG,
  type IntegrationCapability,
  type IntegrationCatalogEntry,
} from "~/lib/integration-catalog";
import {
  type ConnectTarget,
  McpConnectDialog,
} from "./integrations/mcp-connect-dialog";
import { McpLogo } from "./integrations/mcp-logos";
import { McpManageToolsDialog } from "./integrations/mcp-manage-tools-dialog";
import {
  type ConfigConnection,
  ProviderConfigDialog,
  type ProviderId,
} from "./integrations/provider-config-dialog";

const CONNECTION_LOGO_KEY: Partial<Record<ConnectionProviderId, string>> = {
  notion: "notion_oauth",
  github: "github",
};

interface MyMcpServer {
  _id: Id<"mcpServer">;
  authType: "bearer" | "oauth2";
  cachedTools: Array<{ name: string; description: string | null }>;
  catalogId: string | null;
  enabledTools: string[];
  lastErrorAt: number | null;
  lastErrorMessage: string | null;
  name: string;
  status: "active" | "error" | "disabled" | "pending_oauth";
  url: string;
}

export function ConnectionsTab() {
  const { data: connections = [] } = useQuery(
    convexQuery(api.connections.queries.listMyConnections, {})
  );
  const { data: mcpServers = [] } = useQuery(
    convexQuery(api.mcpClient.queries.listMyMcpServers, {})
  );

  const [connectEntry, setConnectEntry] =
    useState<IntegrationCatalogEntry | null>(null);
  const [configProvider, setConfigProvider] = useState<ProviderId | null>(null);
  const [mcpConnectTarget, setMcpConnectTarget] =
    useState<ConnectTarget | null>(null);
  const [manageMcpServerId, setManageMcpServerId] =
    useState<Id<"mcpServer"> | null>(null);
  const [search, setSearch] = useState("");

  const filteredCatalog = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return INTEGRATION_CATALOG;
    }
    return INTEGRATION_CATALOG.filter(
      (entry) =>
        entry.label.toLowerCase().includes(query) ||
        entry.description.toLowerCase().includes(query) ||
        entry.capabilities.some((cap) =>
          CAPABILITY_LABELS[cap].toLowerCase().includes(query)
        )
    );
  }, [search]);

  const customMcpServers = useMemo(
    () => mcpServers.filter((server) => !server.catalogId),
    [mcpServers]
  );

  const manageMcpServer = useMemo(
    () => mcpServers.find((server) => server._id === manageMcpServerId) ?? null,
    [mcpServers, manageMcpServerId]
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connected = params.get("connections");
    if (connected) {
      if (connected === "error") {
        const reason = params.get("reason") ?? "unknown_error";
        toastManager.add({
          type: "error",
          title: "Could not connect",
          description: reason,
        });
      } else {
        toastManager.add({
          type: "success",
          title: "Connected",
        });
      }
      const url = new URL(window.location.href);
      url.searchParams.delete("connections");
      url.searchParams.delete("reason");
      window.history.replaceState({}, "", url.toString());
    }

    const mcpResult = params.get("mcp_connect");
    if (mcpResult) {
      if (mcpResult === "success") {
        toastManager.add({ type: "success", title: "MCP server connected" });
      } else {
        toastManager.add({
          type: "error",
          title: "Could not connect MCP server",
          description: params.get("reason") ?? undefined,
        });
      }
      const url = new URL(window.location.href);
      url.searchParams.delete("mcp_connect");
      url.searchParams.delete("reason");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  const connectionsByProvider = new Map<ProviderId, ConfigConnection>(
    connections
      .filter((connection) => connection.status !== "revoked")
      .map((connection) => [
        connection.provider as ProviderId,
        connection as ConfigConnection,
      ])
  );

  const configConnection = configProvider
    ? (connectionsByProvider.get(configProvider) ?? null)
    : null;

  const handleReconnect = (provider: ProviderId) => {
    const entry = INTEGRATION_CATALOG.find(
      (item) => item.connection?.providerId === provider
    );
    if (entry) {
      setConnectEntry(entry);
    }
  };

  return (
    <div className="flex w-full flex-col gap-8">
      <div>
        <Heading>Connected accounts</Heading>
        <Text className="text-ui-fg-subtle" size="small">
          Accounts you authorize for imports, sync, and chat tools. Configure
          what syncs where in each workspace&apos;s Integrations settings.
        </Text>
      </div>

      <div className="flex flex-col gap-3">
        <Input
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search integrations"
          type="search"
          value={search}
        />
        <div className="flex flex-col gap-2">
          {filteredCatalog.length === 0 ? (
            <Text className="text-ui-fg-subtle" size="small">
              No integrations match your search.
            </Text>
          ) : (
            filteredCatalog.map((entry) => (
              <IntegrationCard
                connection={
                  entry.connection
                    ? connectionsByProvider.get(entry.connection.providerId)
                    : undefined
                }
                entry={entry}
                key={entry.id}
                mcpServer={
                  entry.mcp
                    ? (mcpServers.find(
                        (server) => server.catalogId === entry.mcp?.catalogId
                      ) ?? null)
                    : null
                }
                onConfigureConnection={() => {
                  if (entry.connection) {
                    setConfigProvider(entry.connection.providerId);
                  }
                }}
                onConnectConnection={() => setConnectEntry(entry)}
                onConnectMcp={() => {
                  if (!entry.mcp) {
                    return;
                  }
                  setMcpConnectTarget({
                    catalogId: entry.mcp.catalogId,
                    defaultName: entry.label,
                    authType: entry.mcp.authType,
                    helpUrl: entry.mcp.helpUrl,
                    logoKey: entry.logoKey,
                  });
                }}
                onManageMcp={(serverId) => setManageMcpServerId(serverId)}
              />
            ))
          )}
          {customMcpServers.map((server) => (
            <CustomMcpServerRow
              key={server._id}
              onManage={() => setManageMcpServerId(server._id)}
              server={server}
            />
          ))}
        </div>
      </div>

      <OAuthConnectDialog
        entry={connectEntry}
        onOpenChange={(next) => {
          if (!next) {
            setConnectEntry(null);
          }
        }}
        open={connectEntry !== null}
      />

      <ProviderConfigDialog
        connection={configConnection}
        onOpenChange={(next) => {
          if (!next) {
            setConfigProvider(null);
          }
        }}
        onReconnect={handleReconnect}
        open={configProvider !== null && configConnection !== null}
      />

      <McpConnectDialog
        onOpenChange={(next) => {
          if (!next) {
            setMcpConnectTarget(null);
          }
        }}
        open={mcpConnectTarget !== null}
        target={mcpConnectTarget}
      />

      <McpManageToolsDialog
        onOpenChange={(next) => {
          if (!next) {
            setManageMcpServerId(null);
          }
        }}
        open={manageMcpServer !== null}
        server={manageMcpServer}
      />
    </div>
  );
}

function IntegrationCard({
  entry,
  connection,
  mcpServer,
  onConnectConnection,
  onConfigureConnection,
  onConnectMcp,
  onManageMcp,
}: {
  entry: IntegrationCatalogEntry;
  connection: ConfigConnection | undefined;
  mcpServer: MyMcpServer | null;
  onConnectConnection: () => void;
  onConfigureConnection: () => void;
  onConnectMcp: () => void;
  onManageMcp: (serverId: Id<"mcpServer">) => void;
}) {
  const hasConnection = Boolean(entry.connection);
  const hasMcp = Boolean(entry.mcp);
  const isConnectionConnected = Boolean(connection);
  const isMcpConnected = Boolean(mcpServer);

  return (
    <div className="flex w-full items-center justify-between gap-4 rounded-lg p-4 hover:bg-ui-bg-component">
      <div className="flex min-w-0 items-start gap-3">
        <IntegrationLogo entry={entry} />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Text className="font-medium">{entry.label}</Text>
            {entry.capabilities.map((capability) => (
              <CapabilityBadge capability={capability} key={capability} />
            ))}
            {mcpServer?.status === "error" ? (
              <Badge size="sm" variant="warning">
                Error
              </Badge>
            ) : null}
          </div>
          <Text className="text-ui-fg-subtle" size="xsmall">
            {entry.description}
          </Text>
          {isMcpConnected && mcpServer ? (
            <Text className="text-ui-fg-muted" size="xsmall">
              {mcpServer.enabledTools.length} of {mcpServer.cachedTools.length}{" "}
              tools enabled
            </Text>
          ) : null}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {hasConnection ? (
          isConnectionConnected ? (
            <Button
              onClick={onConfigureConnection}
              size="small"
              variant="secondary"
            >
              Configure account
            </Button>
          ) : (
            <Button onClick={onConnectConnection} size="small" variant="omi">
              Connect
            </Button>
          )
        ) : null}
        {hasMcp ? (
          isMcpConnected && mcpServer ? (
            <Button
              onClick={() => onManageMcp(mcpServer._id)}
              size="small"
              variant="secondary"
            >
              Manage tools
            </Button>
          ) : (
            <Button onClick={onConnectMcp} size="small" variant="omi">
              Connect tools
            </Button>
          )
        ) : null}
      </div>
    </div>
  );
}

function CapabilityBadge({
  capability,
}: {
  capability: IntegrationCapability;
}) {
  return (
    <Badge size="sm" variant="mono">
      {CAPABILITY_LABELS[capability]}
    </Badge>
  );
}

function IntegrationLogo({ entry }: { entry: IntegrationCatalogEntry }) {
  const connectionLogoKey = entry.connection
    ? CONNECTION_LOGO_KEY[entry.connection.providerId]
    : undefined;
  const ConnectionLogo = connectionLogoKey
    ? INTEGRATION_LOGO[connectionLogoKey]
    : undefined;

  if (ConnectionLogo) {
    return (
      <div className="flex size-5 shrink-0 items-center justify-center">
        <ConnectionLogo aria-hidden="true" className="size-5" />
      </div>
    );
  }

  return (
    <div className="flex size-5 shrink-0 items-center justify-center">
      <McpLogo className="size-5" logoKey={entry.logoKey} />
    </div>
  );
}

function CustomMcpServerRow({
  server,
  onManage,
}: {
  server: MyMcpServer;
  onManage: () => void;
}) {
  return (
    <div className="flex w-full items-center justify-between gap-4 rounded-lg p-4 hover:bg-ui-bg-component">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex size-5 shrink-0 items-center justify-center">
          <McpLogo className="size-5" logoKey="__custom__" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Text className="truncate font-medium">{server.name}</Text>
            <CapabilityBadge capability="mcp" />
            {server.status === "error" ? (
              <Badge size="sm" variant="warning">
                Error
              </Badge>
            ) : null}
          </div>
          <Text className="text-ui-fg-muted" size="xsmall">
            {server.enabledTools.length} of {server.cachedTools.length} tools
            enabled
          </Text>
        </div>
      </div>
      <div className="shrink-0">
        <Button onClick={onManage} size="small" variant="secondary">
          Manage tools
        </Button>
      </div>
    </div>
  );
}

function OAuthConnectDialog({
  entry,
  open,
  onOpenChange,
}: {
  entry: IntegrationCatalogEntry | null;
  open: boolean;
  onOpenChange: (next: boolean) => void;
}) {
  const provider = entry?.connection;

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
        title: `Could not start ${entry?.label ?? "connection"}`,
        description: message,
      });
    },
  });

  if (!(entry && provider)) {
    return null;
  }

  const handleRedirect = () => {
    const returnTo = `${window.location.origin}${window.location.pathname}?connections=${provider.providerId}`;
    getAuthorizeUrl({ provider: provider.providerId, returnTo });
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogPopup className="max-w-md!">
        <DialogHeader>
          <DialogTitle className="font-medium text-sm">
            Connect {entry.label}
          </DialogTitle>
        </DialogHeader>
        <div className="px-6 py-4">
          <DialogDescription>
            You'll be redirected to {entry.label} to authorize omi. After
            approving, you'll land back here.
          </DialogDescription>
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="secondary" />}>
            Cancel
          </DialogClose>
          <LoadingButton
            loading={isPending}
            onClick={handleRedirect}
            variant="omi"
          >
            Continue to {entry.label}
          </LoadingButton>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}
