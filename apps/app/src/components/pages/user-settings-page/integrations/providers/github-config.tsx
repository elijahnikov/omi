import { useConvexAction, useConvexMutation } from "@convex-dev/react-query";
import { api } from "@omi/backend/_generated/api.js";
import type { Id } from "@omi/backend/_generated/dataModel.js";
import { Badge } from "@omi/ui/badge";
import { Checkbox } from "@omi/ui/checkbox";
import { Input } from "@omi/ui/input";
import { LoadingButton } from "@omi/ui/loading-button";
import { Switch } from "@omi/ui/switch";
import { Text } from "@omi/ui/text";
import { toastManager } from "@omi/ui/toast";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { DestinationPicker, toErrorMessage } from "../shared";

interface GithubRepo {
  description: string | null;
  fullName: string;
  private: boolean;
}

interface GithubScopeSelection {
  repos?: Array<{ name: string; hookId?: number }>;
  starsEnabled?: boolean;
}

export function GithubSyncForm({
  connectionId,
  workspaceId,
  onComplete,
}: {
  connectionId: Id<"connection">;
  workspaceId: Id<"workspace">;
  onComplete: () => void;
}) {
  const createSyncBinding = useConvexMutation(
    api.connections.bindings.mutations.createSyncBinding
  );
  const [enabling, setEnabling] = useState(false);
  const [destinationCollectionId, setDestinationCollectionId] = useState<
    Id<"collection"> | undefined
  >();
  const repoState = useGithubRepoPicker({
    connectionId,
    initialScope: undefined,
  });

  const canEnable =
    (repoState.selectedRepos.size > 0 || repoState.starsEnabled) && !enabling;

  const handleEnable = async () => {
    setEnabling(true);
    try {
      await createSyncBinding({
        workspaceId,
        connectionId,
        destinationCollectionId,
        scopeSelection: {
          repos: Array.from(repoState.selectedRepos).map((name) => ({ name })),
          starsEnabled: repoState.starsEnabled,
        },
      });
      toastManager.add({
        type: "success",
        title: "Sync enabled",
        description: repoState.starsEnabled
          ? "Webhooks registering. Stars baseline captured shortly."
          : "Webhooks registering on selected repos.",
      });
      onComplete();
    } catch (err) {
      toastManager.add({
        type: "error",
        title: "Could not enable sync",
        description: toErrorMessage(err),
      });
    } finally {
      setEnabling(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <DestinationPicker
        onChange={setDestinationCollectionId}
        value={destinationCollectionId}
        workspaceId={workspaceId}
      />
      <GithubRepoList state={repoState} />
      <GithubStarsToggle state={repoState} />
      <div>
        <LoadingButton
          disabled={!canEnable}
          loading={enabling}
          onClick={handleEnable}
          size="small"
          variant="omi"
        >
          Enable sync
        </LoadingButton>
      </div>
    </div>
  );
}

export function GithubScopeEditor({
  bindingId,
  connectionId,
  workspaceId,
  initialScope,
  onClose,
}: {
  bindingId: Id<"connectionSyncBinding">;
  connectionId: Id<"connection">;
  workspaceId: Id<"workspace">;
  initialScope: GithubScopeSelection | undefined;
  onClose: () => void;
}) {
  const setScope = useConvexMutation(
    api.connections.bindings.mutations.setScopeSelection
  );
  const [saving, setSaving] = useState(false);
  const repoState = useGithubRepoPicker({
    connectionId,
    initialScope,
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await setScope({
        workspaceId,
        bindingId,
        scopeSelection: {
          repos: Array.from(repoState.selectedRepos).map((name) => ({ name })),
          starsEnabled: repoState.starsEnabled,
        },
      });
      toastManager.add({
        type: "success",
        title: "Repository selection updated",
      });
      onClose();
    } catch (err) {
      toastManager.add({
        type: "error",
        title: "Could not update repos",
        description: toErrorMessage(err),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <GithubRepoList state={repoState} />
      <GithubStarsToggle state={repoState} />
      <div>
        <LoadingButton
          loading={saving}
          onClick={handleSave}
          size="small"
          variant="omi"
        >
          Save selection
        </LoadingButton>
      </div>
    </div>
  );
}

interface GithubRepoPickerState {
  filter: string;
  filtered: GithubRepo[];
  loading: boolean;
  repos: GithubRepo[] | null;
  selectedRepos: Set<string>;
  setFilter: (next: string) => void;
  setStarsEnabled: (next: boolean) => void;
  starsEnabled: boolean;
  toggleRepo: (name: string) => void;
}

function useGithubRepoPicker({
  connectionId,
  initialScope,
}: {
  connectionId: Id<"connection"> | undefined;
  initialScope: GithubScopeSelection | undefined;
}): GithubRepoPickerState {
  const listRepos = useConvexAction(
    api.connections.providers.github_actions.listMyRepos
  );
  const [selectedRepos, setSelectedRepos] = useState<Set<string>>(
    () => new Set(initialScope?.repos?.map((r) => r.name) ?? [])
  );
  const [starsEnabled, setStarsEnabled] = useState(
    Boolean(initialScope?.starsEnabled)
  );
  const [filter, setFilter] = useState("");

  const reposQuery = useQuery({
    queryKey: ["github-repos", connectionId],
    queryFn: () => {
      if (!connectionId) {
        return Promise.resolve([]);
      }
      return listRepos({ connectionId });
    },
    enabled: Boolean(connectionId),
  });
  const repos: GithubRepo[] | null =
    reposQuery.data ?? (reposQuery.isError ? [] : connectionId ? null : []);
  const loading = connectionId ? reposQuery.isPending : false;

  const filtered = useMemo(() => {
    if (!repos) {
      return [];
    }
    const q = filter.trim().toLowerCase();
    if (!q) {
      return repos;
    }
    return repos.filter((r) => r.fullName.toLowerCase().includes(q));
  }, [repos, filter]);

  const toggleRepo = (name: string) => {
    setSelectedRepos((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  return {
    filter,
    filtered,
    loading,
    repos,
    selectedRepos,
    setFilter,
    starsEnabled,
    setStarsEnabled,
    toggleRepo,
  };
}

function GithubRepoList({ state }: { state: GithubRepoPickerState }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Text className="font-medium" size="small">
        Repositories
      </Text>
      <Input
        onChange={(e) => state.setFilter(e.target.value)}
        placeholder="Filter repos…"
        type="search"
        value={state.filter}
      />
      <div className="max-h-72 overflow-y-auto rounded-md border border-ui-border-base">
        {state.loading ? (
          <div className="px-3 py-4">
            <Text className="text-ui-fg-subtle" size="small">
              Loading repositories…
            </Text>
          </div>
        ) : state.filtered.length === 0 ? (
          <div className="px-3 py-4">
            <Text className="text-ui-fg-subtle" size="small">
              {state.repos && state.repos.length === 0
                ? "No admin-eligible repositories found on your account."
                : "No repos match the filter."}
            </Text>
          </div>
        ) : (
          state.filtered.map((r) => (
            <button
              className="flex w-full cursor-pointer items-start gap-2 px-3 py-2 text-left hover:bg-ui-bg-component"
              key={r.fullName}
              onClick={() => state.toggleRepo(r.fullName)}
              type="button"
            >
              <Checkbox
                checked={state.selectedRepos.has(r.fullName)}
                onCheckedChange={() => state.toggleRepo(r.fullName)}
              />
              <div className="min-w-0">
                <Text className="font-medium" size="small">
                  {r.fullName}
                  {r.private ? (
                    <Badge className="ml-2" size="sm" variant="warning">
                      private
                    </Badge>
                  ) : null}
                </Text>
                {r.description ? (
                  <Text className="text-ui-fg-subtle" size="small">
                    {r.description}
                  </Text>
                ) : null}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function GithubStarsToggle({ state }: { state: GithubRepoPickerState }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <Text className="font-medium" size="small">
          Track new stars
        </Text>
        <Text className="text-ui-fg-subtle" size="small">
          Adds a resource for each repo you star going forward. Existing stars
          are not pulled in.
        </Text>
      </div>
      <Switch
        checked={state.starsEnabled}
        onCheckedChange={(next) => state.setStarsEnabled(Boolean(next))}
      />
    </div>
  );
}
