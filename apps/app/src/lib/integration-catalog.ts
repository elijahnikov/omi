export type IntegrationCapability = "import" | "sync" | "mcp";

export type ConnectionProviderId = "notion" | "github" | "linear";

export interface IntegrationCatalogEntry {
  capabilities: IntegrationCapability[];
  connection?: {
    authType: "oauth2" | "api_token";
    providerId: ConnectionProviderId;
    tokenHelpUrl?: string;
  };
  description: string;
  id: string;
  label: string;
  logoKey: string;
  mcp?: {
    authType: "bearer" | "oauth2";
    catalogId: string;
    helpUrl?: string;
  };
}

/** Single source of truth for user-facing integrations. Add new providers here. */
export const INTEGRATION_CATALOG: IntegrationCatalogEntry[] = [
  {
    id: "notion",
    label: "Notion",
    description:
      "Import pages, keep them synced, and use Notion tools in chat.",
    logoKey: "notion",
    capabilities: ["import", "sync", "mcp"],
    connection: {
      providerId: "notion",
      authType: "oauth2",
    },
    mcp: {
      catalogId: "notion",
      authType: "oauth2",
    },
  },
  {
    id: "github",
    label: "GitHub",
    description: "Sync issues and pull requests from selected repositories.",
    logoKey: "github",
    capabilities: ["sync"],
    connection: {
      providerId: "github",
      authType: "oauth2",
    },
  },
  {
    id: "linear",
    label: "Linear",
    description:
      "Sync issues into your workspace and use Linear tools in chat.",
    logoKey: "linear",
    capabilities: ["sync", "mcp"],
    connection: {
      providerId: "linear",
      authType: "oauth2",
    },
    mcp: {
      catalogId: "linear",
      authType: "oauth2",
      helpUrl: "https://linear.app/docs/mcp",
    },
  },
];

export const CAPABILITY_LABELS: Record<IntegrationCapability, string> = {
  import: "Import",
  sync: "Sync",
  mcp: "Tools",
};
