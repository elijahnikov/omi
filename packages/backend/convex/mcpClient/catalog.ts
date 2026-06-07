export interface CatalogEntry {
  authType: "bearer" | "oauth2";
  catalogId: string;
  description: string;
  helpUrl?: string;
  logoKey: string;
  name: string;
  oauthScope?: string;
  url: string;
}
export const MCP_CATALOG: readonly CatalogEntry[] = [
  {
    catalogId: "linear",
    name: "Linear",
    description: "Issues, projects, and cycles.",
    logoKey: "linear",
    url: "https://mcp.linear.app/mcp",
    authType: "oauth2",
    helpUrl: "https://linear.app/docs/mcp",
  },
  {
    catalogId: "notion",
    name: "Notion (MCP)",
    description: "Pages, databases, and search.",
    logoKey: "notion",
    url: "https://mcp.notion.com/mcp",
    authType: "oauth2",
  },
] as const;
export function findCatalogEntry(catalogId: string): CatalogEntry | undefined {
  return MCP_CATALOG.find((entry) => entry.catalogId === catalogId);
}
