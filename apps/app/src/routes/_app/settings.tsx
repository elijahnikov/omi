import type { Id } from "@omi/backend/_generated/dataModel.js";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback } from "react";
import {
  UserSettingsPageComponent,
  type UserSettingsTab,
} from "~/components/pages/user-settings-page";
import { usePostCheckoutBillingSync } from "~/components/pages/user-settings-page/billing-tab";

const USER_SETTINGS_TABS: readonly UserSettingsTab[] = [
  "general",
  "workspaces",
  "connections",
  "devices",
  "mcp",
  "usage",
  "billing",
  "account",
];

interface Search {
  checkout?: "success" | "cancel";
  tab?: UserSettingsTab;
  workspaceId?: Id<"workspace">;
}

export const Route = createFileRoute("/_app/settings")({
  component: SettingsPage,
  validateSearch: (search: Record<string, unknown>): Search => {
    const tab = USER_SETTINGS_TABS.includes(search.tab as UserSettingsTab)
      ? (search.tab as UserSettingsTab)
      : undefined;
    const checkout =
      search.checkout === "success" || search.checkout === "cancel"
        ? (search.checkout as "success" | "cancel")
        : undefined;
    const workspaceId =
      typeof search.workspaceId === "string" && search.workspaceId.length > 0
        ? (search.workspaceId as Id<"workspace">)
        : undefined;
    return { tab, checkout, workspaceId };
  },
});

function SettingsPage() {
  const { tab, workspaceId, checkout } = Route.useSearch();
  const navigate = Route.useNavigate();
  const clearCheckout = useCallback(() => {
    navigate({
      replace: true,
      search: (prev) => ({ ...prev, checkout: undefined }),
    });
  }, [navigate]);

  usePostCheckoutBillingSync(checkout, clearCheckout);

  const activeTab =
    tab ??
    (checkout === "success" || checkout === "cancel" ? "billing" : "general");

  return (
    <UserSettingsPageComponent
      onTabChange={(next) =>
        navigate({
          replace: true,
          search: (prev) => ({
            ...prev,
            tab: next === "general" ? undefined : next,
          }),
        })
      }
      tab={activeTab}
      workspaceId={workspaceId}
    />
  );
}
