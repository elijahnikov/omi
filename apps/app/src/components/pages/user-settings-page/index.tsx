import { SidebarInset, SidebarProvider } from "@omi/ui/sidebar";
import { Tabs, TabsContent } from "@omi/ui/tabs";
import { type ReactNode, Suspense } from "react";
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

export type UserSettingsTab =
  | "general"
  | "workspaces"
  | "connections"
  | "devices"
  | "mcp"
  | "usage"
  | "billing"
  | "account";

export function UserSettingsPageComponent({
  tab,
  onTabChange,
}: {
  tab: UserSettingsTab;
  onTabChange: (next: UserSettingsTab) => void;
}) {
  return (
    <SidebarProvider className="relative bg-ui-bg-subtle!" open>
      <UserSettingsSidebar onTabChange={onTabChange} tab={tab} />
      <SidebarInset className="relative mx-2 mt-1 rounded-t-2xl shadow-borders-base transition-[background-color,box-shadow] duration-200 md:h-[calc(100vh-12px)]">
        <main className="h-full flex-1 overflow-y-auto">
          <Tabs
            className="h-full"
            onValueChange={(next) => onTabChange(next as UserSettingsTab)}
            orientation="vertical"
            value={tab}
          >
            <div className="flex min-w-0 flex-1 justify-center">
              <div className="mx-auto min-h-[calc(95vh-80px)] w-full max-w-[640px] px-4 py-8 md:px-0">
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
                  <BillingTab />
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
