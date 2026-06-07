import type { Id } from "@omi/backend/_generated/dataModel.js";

export type UserSettingsTab =
  | "general"
  | "workspaces"
  | "connections"
  | "devices"
  | "mcp"
  | "usage"
  | "billing"
  | "account";

export interface UserSettingsSearch {
  checkout?: "success" | "cancel";
  tab?: UserSettingsTab;
  workspaceId?: Id<"workspace">;
}

export function userSettingsBackNavigation(workspaceId?: Id<"workspace">) {
  if (workspaceId) {
    return {
      to: "/workspace/$workspaceId" as const,
      params: { workspaceId },
    };
  }
  return { to: "/" as const };
}

export function userSettingsSearch(
  search: UserSettingsSearch = {}
): UserSettingsSearch {
  return {
    ...(search.tab ? { tab: search.tab } : {}),
    ...(search.checkout ? { checkout: search.checkout } : {}),
    ...(search.workspaceId ? { workspaceId: search.workspaceId } : {}),
  };
}

export function userSettingsPath(search: UserSettingsSearch = {}) {
  const params = new URLSearchParams();
  if (search.tab) {
    params.set("tab", search.tab);
  }
  if (search.checkout) {
    params.set("checkout", search.checkout);
  }
  if (search.workspaceId) {
    params.set("workspaceId", search.workspaceId);
  }
  const query = params.toString();
  return query ? `/settings?${query}` : "/settings";
}
