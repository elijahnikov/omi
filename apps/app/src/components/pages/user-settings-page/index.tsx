import type { Id } from "@omi/backend/_generated/dataModel.js";
import { cn } from "@omi/ui";
import { Button } from "@omi/ui/button";
import { SidebarInset, SidebarProvider } from "@omi/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@omi/ui/tabs";
import { Text } from "@omi/ui/text";
import {
  RiArrowLeftLine,
  RiBankCardFill,
  RiBarChart2Fill,
  RiBuilding2Fill,
  RiComputerFill,
  RiLinksFill,
  RiPlugFill,
  RiShieldUserFill,
  RiUserFill,
} from "@remixicon/react";
import { useNavigate } from "@tanstack/react-router";
import { type ReactNode, Suspense } from "react";
import {
  type UserSettingsTab,
  userSettingsBackNavigation,
} from "~/lib/user-settings-nav";
import { AccountTab } from "./account-tab";
import { BillingTab } from "./billing-tab";
import { ConnectionsTab } from "./connections-tab";
import { DevicesTab } from "./devices-tab";
import { GeneralTab } from "./general-tab";
import { McpTab } from "./mcp-tab";
import { TabSkeleton } from "./tab-skeleton";
import { UsageTab } from "./usage-tab";
import UserSettingsSidebar from "./user-settings-sidebar";
import { WorkspacesTab } from "./workspaces-tab";

const MOBILE_TABS: {
  value: UserSettingsTab;
  label: string;
  icon: React.ElementType;
}[] = [
  { value: "general", label: "General", icon: RiUserFill },
  { value: "account", label: "Account", icon: RiShieldUserFill },
  { value: "workspaces", label: "Workspaces", icon: RiBuilding2Fill },
  { value: "connections", label: "Accounts", icon: RiLinksFill },
  { value: "mcp", label: "MCP", icon: RiPlugFill },
  { value: "devices", label: "Devices", icon: RiComputerFill },
  { value: "usage", label: "Usage", icon: RiBarChart2Fill },
  { value: "billing", label: "Billing", icon: RiBankCardFill },
];

function MobileTabLink({
  value,
  label,
  icon: Icon,
}: {
  value: UserSettingsTab;
  label: string;
  icon: React.ElementType;
}) {
  return (
    <TabsTrigger
      className={cn(
        "group/menu flex h-7! w-auto! shrink-0 grow-0 items-center justify-start gap-x-2 overflow-hidden rounded-md border-transparent px-2 text-left font-sans text-[13px] outline-none transition-colors duration-200 focus-visible:bg-transparent! focus-visible:shadow-borders-interactive-with-active! sm:h-7!",
        "text-ui-fg-muted/70 hover:bg-[rgba(0,0,0,0.070)] hover:text-ui-fg-base data-[active]:bg-ui-bg-base data-[active]:text-ui-fg-base data-[active]:shadow-buttons-neutral! dark:hover:bg-[rgba(255,255,255,0.070)]"
      )}
      value={value}
    >
      <Icon className="size-3.5! shrink-0" />
      <Text className="whitespace-nowrap" size="small" weight="plus">
        {label}
      </Text>
    </TabsTrigger>
  );
}

function TabPanel({
  value,
  children,
}: {
  value: UserSettingsTab;
  children: ReactNode;
}) {
  return (
    <TabsContent keepMounted value={value}>
      <Suspense fallback={<TabSkeleton />}>{children}</Suspense>
    </TabsContent>
  );
}

export type { UserSettingsTab } from "~/lib/user-settings-nav";

export function UserSettingsPageComponent({
  tab,
  onTabChange,
  workspaceId,
}: {
  tab: UserSettingsTab;
  onTabChange: (next: UserSettingsTab) => void;
  workspaceId?: Id<"workspace">;
}) {
  const navigate = useNavigate();
  const goBack = () => navigate(userSettingsBackNavigation(workspaceId));

  return (
    <SidebarProvider className="relative bg-ui-bg-subtle!" open>
      <UserSettingsSidebar
        onBack={goBack}
        onTabChange={onTabChange}
        tab={tab}
      />
      <SidebarInset className="relative mx-2 mt-1 h-[calc(100svh-8px)] rounded-t-2xl shadow-borders-base transition-[background-color,box-shadow] duration-200 md:h-[calc(100vh-16px)]">
        <main className="h-full flex-1 overflow-y-auto">
          <Tabs
            className="h-full flex-col!"
            onValueChange={(next) => onTabChange(next as UserSettingsTab)}
            orientation="vertical"
            value={tab}
          >
            <div className="sticky top-0 z-10 flex w-full shrink-0 items-center gap-1 overflow-x-auto border-b-[0.5px] bg-ui-bg-base p-2 md:hidden">
              <Button
                aria-label="Back"
                className="shrink-0"
                onClick={goBack}
                size="small"
                variant="ghost"
              >
                <RiArrowLeftLine className="size-4" />
              </Button>
              <TabsList className="w-max flex-row! items-stretch justify-start gap-1 bg-transparent p-0">
                {MOBILE_TABS.map((t) => (
                  <MobileTabLink
                    icon={t.icon}
                    key={t.value}
                    label={t.label}
                    value={t.value}
                  />
                ))}
              </TabsList>
            </div>
            <div className="flex min-w-0 flex-1 justify-center">
              <div className="mx-auto min-h-[calc(95vh-80px)] w-full max-w-[640px] px-4 pt-3 pb-8 md:px-0 md:pt-8">
                <TabPanel value="general">
                  <GeneralTab />
                </TabPanel>
                <TabPanel value="workspaces">
                  <WorkspacesTab />
                </TabPanel>
                <TabPanel value="connections">
                  <ConnectionsTab />
                </TabPanel>
                <TabPanel value="devices">
                  <DevicesTab />
                </TabPanel>
                <TabPanel value="mcp">
                  <McpTab />
                </TabPanel>
                <TabPanel value="usage">
                  <UsageTab />
                </TabPanel>
                <TabPanel value="billing">
                  <BillingTab workspaceId={workspaceId} />
                </TabPanel>
                <TabPanel value="account">
                  <AccountTab />
                </TabPanel>
              </div>
            </div>
          </Tabs>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
