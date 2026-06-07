import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { api } from "@omi/backend/_generated/api.js";
import type { Id } from "@omi/backend/_generated/dataModel.js";
import { cn } from "@omi/ui";
import { Badge } from "@omi/ui/badge";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPopup,
  DialogTitle,
} from "@omi/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@omi/ui/form";
import { Heading } from "@omi/ui/heading";
import { Input } from "@omi/ui/input";
import { LoadingButton } from "@omi/ui/loading-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@omi/ui/tabs";
import { Text } from "@omi/ui/text";
import {
  RiBrain2Fill,
  RiDownload2Fill,
  RiGroupFill,
  RiKey2Fill,
  RiLinksFill,
  RiSettings3Fill,
  RiShieldKeyholeFill,
} from "@remixicon/react";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  WorkspaceIcon,
  WorkspaceIconSelector,
} from "~/components/common/workspace-icon";
import { AIProviderTab } from "./ai-provider-tab";
import { ImportTab } from "./import-tab";
import { IntegrationsTab } from "./integrations-tab";
import { MembersTab } from "./members-tab";
import { MemoryTab } from "./memory-tab";

function SettingsTabLink({
  value,
  label,
  icon: Icon,
}: {
  value: SettingsTab;
  label: string;
  icon: React.ElementType;
}) {
  return (
    <TabsTrigger
      className={cn(
        "group/menu flex h-7! w-auto! shrink-0 grow-0 items-center justify-start gap-x-2 overflow-hidden rounded-md border-transparent px-2 text-left font-sans text-[13px] outline-none transition-colors duration-200 focus-visible:bg-transparent! focus-visible:shadow-borders-interactive-with-active! sm:h-7! md:w-full!",
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

export type SettingsTab =
  | "general"
  | "members"
  | "memory"
  | "ai-provider"
  | "import"
  | "integrations"
  | "advanced";

export function SettingsPageComponent({
  workspaceId,
  tab,
  onTabChange,
}: {
  workspaceId: Id<"workspace">;
  tab: SettingsTab;
  onTabChange: (next: SettingsTab) => void;
}) {
  const { data } = useSuspenseQuery(
    convexQuery(api.workspace.queries.getById, { workspaceId })
  );

  return (
    <Tabs
      className="h-full flex-col! md:flex-row!"
      onValueChange={(next) => onTabChange(next as SettingsTab)}
      orientation="vertical"
      value={tab}
    >
      <div className="sticky top-0 z-10 flex w-full shrink-0 flex-col items-start gap-3 self-start overflow-x-auto border-b-[0.5px] bg-ui-bg-base px-2 py-2 md:h-screen md:w-52 md:items-stretch md:border-r-[0.5px] md:border-b-0 md:bg-transparent md:px-3 md:pt-3 md:pb-8">
        <TabsList className="w-max flex-row! items-stretch justify-start gap-1 bg-transparent p-0 md:w-full md:flex-col!">
          <SettingsTabLink
            icon={RiSettings3Fill}
            label="General"
            value="general"
          />
          <SettingsTabLink icon={RiGroupFill} label="Members" value="members" />
          <SettingsTabLink icon={RiBrain2Fill} label="Memory" value="memory" />
          <SettingsTabLink
            icon={RiKey2Fill}
            label="AI provider"
            value="ai-provider"
          />
          <SettingsTabLink
            icon={RiDownload2Fill}
            label="Import"
            value="import"
          />
          <SettingsTabLink
            icon={RiLinksFill}
            label="Integrations"
            value="integrations"
          />
          <SettingsTabLink
            icon={RiShieldKeyholeFill}
            label="Advanced"
            value="advanced"
          />
        </TabsList>
      </div>
      <div className="flex min-w-0 flex-1 justify-center">
        <div className="mt-3 min-h-[calc(100vh-140px)] w-full max-w-[640px] px-4 pt-3 pb-8 md:px-0">
          <TabsContent value="general">
            <GeneralTab
              isAdminOrOwner={
                data.member?.role === "owner" || data.member?.role === "admin"
              }
              workspace={data.workspace}
              workspaceId={workspaceId}
            />
          </TabsContent>
          <TabsContent value="members">
            <MembersTab
              currentUserRole={data.member?.role}
              workspaceId={workspaceId}
            />
          </TabsContent>
          <TabsContent value="memory">
            <MemoryTab workspaceId={workspaceId} />
          </TabsContent>
          <TabsContent value="ai-provider">
            <AIProviderTab workspaceId={workspaceId} />
          </TabsContent>
          <TabsContent value="import">
            <ImportTab workspaceId={workspaceId} />
          </TabsContent>
          <TabsContent value="integrations">
            <IntegrationsTab workspaceId={workspaceId} />
          </TabsContent>
          <TabsContent value="advanced">
            <AdvancedTab
              isOwner={data.member?.role === "owner"}
              workspaceId={workspaceId}
              workspaceName={data.workspace.name}
            />
          </TabsContent>
        </div>
      </div>
      <div aria-hidden className="hidden w-52 shrink-0 md:block" />
    </Tabs>
  );
}

interface WorkspaceFormValues {
  emoji?: string;
  icon?: string;
  iconColor?: string;
  name: string;
}

function GeneralTab({
  workspaceId,
  workspace,
  isAdminOrOwner,
}: {
  workspaceId: Id<"workspace">;
  workspace: {
    name: string;
    icon?: string;
    iconColor?: string;
    emoji?: string;
  };
  isAdminOrOwner: boolean;
}) {
  const form = useForm<WorkspaceFormValues>({
    defaultValues: {
      name: workspace.name,
      icon: workspace.icon,
      iconColor: workspace.iconColor,
      emoji: workspace.emoji,
    },
  });

  useEffect(() => {
    form.reset({
      name: workspace.name,
      icon: workspace.icon,
      iconColor: workspace.iconColor,
      emoji: workspace.emoji,
    });
  }, [
    workspace.name,
    workspace.icon,
    workspace.iconColor,
    workspace.emoji,
    form,
  ]);

  const { mutate: save, isPending } = useMutation({
    mutationFn: useConvexMutation(api.workspace.mutations.update),
    onSuccess: () => {
      form.reset(form.getValues());
    },
  });

  const watchedIcon = form.watch("icon");
  const watchedIconColor = form.watch("iconColor");
  const watchedEmoji = form.watch("emoji");

  return (
    <div className="w-full">
      <div className="mb-8">
        <Heading>General</Heading>
        <Text className="text-ui-fg-subtle" size="small">
          Manage your workspace
        </Text>
      </div>
      <Form {...form}>
        <form
          className="flex w-full flex-col gap-4"
          onSubmit={form.handleSubmit((values) =>
            save({
              workspaceId,
              name: values.name,
              icon: values.icon,
              iconColor: values.iconColor,
              emoji: values.emoji,
            })
          )}
        >
          <div className="flex items-center gap-3">
            {isAdminOrOwner ? (
              <WorkspaceIconSelector
                currentEmoji={watchedEmoji}
                currentIcon={watchedIcon}
                currentIconColor={watchedIconColor}
                onSelect={(value) => {
                  if (value.type === "emoji") {
                    form.setValue("emoji", value.emoji, {
                      shouldDirty: true,
                    });
                    form.setValue("icon", undefined, { shouldDirty: true });
                    form.setValue("iconColor", undefined, {
                      shouldDirty: true,
                    });
                  } else {
                    form.setValue("icon", value.name, { shouldDirty: true });
                    form.setValue("iconColor", value.color, {
                      shouldDirty: true,
                    });
                    form.setValue("emoji", undefined, { shouldDirty: true });
                  }
                }}
              >
                <WorkspaceIcon
                  className="cursor-pointer rounded-full border p-1 transition-colors hover:bg-ui-bg-subtle-hover"
                  emoji={watchedEmoji}
                  icon={watchedIcon}
                  iconColor={watchedIconColor}
                  size="lg"
                />
              </WorkspaceIconSelector>
            ) : (
              <WorkspaceIcon
                className="rounded-md bg-ui-bg-subtle p-1"
                emoji={watchedEmoji}
                icon={watchedIcon}
                iconColor={watchedIconColor}
                size="lg"
              />
            )}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      className="w-full"
                      disabled={!isAdminOrOwner}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
              rules={{ required: "Workspace name is required" }}
            />
          </div>
          {isAdminOrOwner && (
            <LoadingButton
              disabled={!form.formState.isDirty}
              loading={isPending}
              size="small"
              type="submit"
              variant={"omi"}
            >
              Save changes
            </LoadingButton>
          )}
        </form>
      </Form>
    </div>
  );
}

function AdvancedTab({
  workspaceId,
  workspaceName,
  isOwner,
}: {
  workspaceId: Id<"workspace">;
  workspaceName: string;
  isOwner: boolean;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const navigate = useNavigate();

  const { data: workspaces } = useSuspenseQuery(
    convexQuery(api.workspace.queries.listByUser, {})
  );
  const ownedCount = workspaces.filter((w) => w.role === "owner").length;
  const isLastOwned = isOwner && ownedCount === 1;

  const { mutate: deleteWorkspace, isPending } = useMutation({
    mutationFn: useConvexMutation(api.workspace.mutations.deleteWorkspace),
    onSuccess: () => {
      navigate({ to: "/" });
    },
  });

  return (
    <div>
      <div className="mb-6">
        <Heading>Advanced</Heading>
        <Text className="text-ui-fg-subtle" size="small">
          Danger zone and advanced workspace settings
        </Text>
      </div>
      <div className="mt-10">
        <div className="flex items-center justify-between">
          <div>
            <Text className="font-medium">Delete workspace</Text>
            <Text className="text-ui-fg-muted" size="small">
              {isLastOwned
                ? "You must keep at least one workspace. Create another before deleting this one."
                : "Permanently delete this workspace and all of its data."}
            </Text>
          </div>
          <Dialog onOpenChange={setConfirmOpen} open={confirmOpen}>
            <LoadingButton
              disabled={!isOwner || isLastOwned}
              loading={false}
              onClick={() => setConfirmOpen(true)}
              size="small"
              variant="destructive"
            >
              Delete workspace
            </LoadingButton>
            <DialogPopup>
              <DialogHeader>
                <DialogTitle className="font-medium text-sm">
                  Delete workspace
                </DialogTitle>
              </DialogHeader>
              <div className="px-6 py-4">
                <DialogDescription className="mb-4">
                  This action cannot be undone. All resources, collections, and
                  members will be permanently removed.
                </DialogDescription>
                <div>
                  <Text className="mb-1.5" size="small">
                    Type{" "}
                    <Badge className="mx-0.5" variant="mono">
                      {workspaceName}
                    </Badge>{" "}
                    to confirm
                  </Text>
                  <Input
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder={workspaceName}
                    value={confirmText}
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose
                  onClick={() => setConfirmText("")}
                  render={<LoadingButton loading={false} variant="secondary" />}
                >
                  Cancel
                </DialogClose>
                <LoadingButton
                  disabled={confirmText !== workspaceName}
                  loading={isPending}
                  onClick={() => deleteWorkspace({ workspaceId })}
                  variant="destructive"
                >
                  Delete workspace
                </LoadingButton>
              </DialogFooter>
            </DialogPopup>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
