import { cn } from "@omi/ui";
import { Button } from "@omi/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
} from "@omi/ui/sidebar";
import { Text } from "@omi/ui/text";
import { TooltipProvider } from "@omi/ui/tooltip";
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
import { memo } from "react";
import type { UserSettingsTab } from ".";

interface SettingsItem {
  icon: React.ElementType;
  label: string;
  value: UserSettingsTab;
}

interface SettingsGroup {
  items: SettingsItem[];
  label: string;
}

const SETTINGS_GROUPS: SettingsGroup[] = [
  {
    label: "Account",
    items: [
      { value: "general", label: "General", icon: RiUserFill },
      { value: "account", label: "Account", icon: RiShieldUserFill },
      { value: "workspaces", label: "Workspaces", icon: RiBuilding2Fill },
    ],
  },
  {
    label: "Integrations",
    items: [
      { value: "connections", label: "Connected accounts", icon: RiLinksFill },
      { value: "mcp", label: "MCP", icon: RiPlugFill },
      { value: "devices", label: "Devices", icon: RiComputerFill },
    ],
  },
  {
    label: "Plan & Billing",
    items: [
      { value: "usage", label: "Usage", icon: RiBarChart2Fill },
      { value: "billing", label: "Billing", icon: RiBankCardFill },
    ],
  },
];

function SidebarTabButton({
  item,
  isActive,
  onSelect,
}: {
  item: SettingsItem;
  isActive: boolean;
  onSelect: (next: UserSettingsTab) => void;
}) {
  const Icon = item.icon as React.ComponentType<{ className?: string }>;

  const buttonClassName = cn(
    "group/menu flex h-7 w-full items-center justify-start gap-x-2 overflow-hidden rounded-md px-2 text-left font-sans text-[13px] focus-visible:bg-transparent! focus-visible:shadow-borders-interactive-with-active!",
    isActive
      ? "bg-ui-bg-base text-ui-fg-base shadow-buttons-neutral! hover:bg-ui-bg-base active:bg-ui-bg-base"
      : "text-ui-fg-muted/70 transition-colors duration-200 hover:bg-[rgba(0,0,0,0.070)] hover:text-ui-fg-base dark:hover:bg-[rgba(255,255,255,0.070)]"
  );

  return (
    <Button
      className={buttonClassName}
      onClick={() => onSelect(item.value)}
      size="small"
      variant="ghost"
    >
      <Icon className="size-3.5 shrink-0" />
      <Text className="whitespace-nowrap" size="small" weight="plus">
        {item.label}
      </Text>
    </Button>
  );
}

const MemoSidebarTabButton = memo(SidebarTabButton);

interface UserSettingsSidebarProps {
  onBack: () => void;
  onTabChange: (next: UserSettingsTab) => void;
  tab: UserSettingsTab;
}

export default function UserSettingsSidebar({
  tab,
  onTabChange,
  onBack,
}: UserSettingsSidebarProps) {
  return (
    <TooltipProvider>
      <Sidebar className="z-50 -mt-0.5 pl-[4px]" variant="inset">
        <SidebarHeader className="px-2">
          <Button
            className="h-7 w-full items-center justify-start gap-x-2 overflow-hidden rounded-md px-2 text-ui-fg-muted/70 hover:text-ui-fg-base"
            onClick={onBack}
            size="small"
            variant="ghost"
          >
            <RiArrowLeftLine className="size-3.5 shrink-0" />
            <Text className="whitespace-nowrap" size="small" weight="plus">
              Back
            </Text>
          </Button>
        </SidebarHeader>
        <SidebarContent className="w-full px-2 pt-1">
          {SETTINGS_GROUPS.map((group) => (
            <SidebarGroup className="p-0" key={group.label}>
              <SidebarGroupLabel className="px-2">
                {group.label}
              </SidebarGroupLabel>
              <div className="flex w-full flex-col gap-1">
                {group.items.map((item) => (
                  <MemoSidebarTabButton
                    isActive={tab === item.value}
                    item={item}
                    key={item.value}
                    onSelect={onTabChange}
                  />
                ))}
              </div>
            </SidebarGroup>
          ))}
        </SidebarContent>
        <SidebarFooter className="relative bottom-2 px-2" />
      </Sidebar>
    </TooltipProvider>
  );
}
