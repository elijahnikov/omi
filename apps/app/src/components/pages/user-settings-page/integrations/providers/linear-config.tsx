import { useConvexAction, useConvexMutation } from "@convex-dev/react-query";
import { api } from "@omi/backend/_generated/api.js";
import type { Id } from "@omi/backend/_generated/dataModel.js";
import { Checkbox } from "@omi/ui/checkbox";
import { Input } from "@omi/ui/input";
import { LoadingButton } from "@omi/ui/loading-button";
import { Text } from "@omi/ui/text";
import { toastManager } from "@omi/ui/toast";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { DestinationPicker, toErrorMessage } from "../shared";

interface LinearTeam {
  id: string;
  name: string;
}

interface LinearScopeSelection {
  teams?: Array<{ id: string; name: string; webhookId?: string }>;
}

export function LinearSyncForm({
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
  const teamState = useLinearTeamPicker({
    connectionId,
    initialScope: undefined,
  });

  const canEnable = teamState.selectedTeams.size > 0 && !enabling;

  const handleEnable = async () => {
    setEnabling(true);
    try {
      await createSyncBinding({
        workspaceId,
        connectionId,
        destinationCollectionId,
        scopeSelection: {
          teams: Array.from(teamState.selectedTeams).map((id) => {
            const team = teamState.teams?.find((entry) => entry.id === id);
            return { id, name: team?.name ?? id };
          }),
        },
      });
      toastManager.add({
        type: "success",
        title: "Sync enabled",
        description:
          "Importing existing issues and registering webhooks. Reconnect Linear in Connected accounts if new issues don't appear.",
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
      <LinearTeamList state={teamState} />
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

export function LinearScopeEditor({
  bindingId,
  connectionId,
  workspaceId,
  initialScope,
  onClose,
}: {
  bindingId: Id<"connectionSyncBinding">;
  connectionId: Id<"connection">;
  workspaceId: Id<"workspace">;
  initialScope: LinearScopeSelection | undefined;
  onClose: () => void;
}) {
  const setScope = useConvexMutation(
    api.connections.bindings.mutations.setScopeSelection
  );
  const [saving, setSaving] = useState(false);
  const teamState = useLinearTeamPicker({
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
          teams: Array.from(teamState.selectedTeams).map((id) => {
            const team = teamState.teams?.find((entry) => entry.id === id);
            return { id, name: team?.name ?? id };
          }),
        },
      });
      toastManager.add({
        type: "success",
        title: "Team selection updated",
      });
      onClose();
    } catch (err) {
      toastManager.add({
        type: "error",
        title: "Could not update teams",
        description: toErrorMessage(err),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <LinearTeamList state={teamState} />
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

interface LinearTeamPickerState {
  filter: string;
  filtered: LinearTeam[];
  loading: boolean;
  selectedTeams: Set<string>;
  setFilter: (next: string) => void;
  teams: LinearTeam[] | null;
  toggleTeam: (id: string) => void;
}

function useLinearTeamPicker({
  connectionId,
  initialScope,
}: {
  connectionId: Id<"connection"> | undefined;
  initialScope: LinearScopeSelection | undefined;
}): LinearTeamPickerState {
  const listTeams = useConvexAction(
    api.connections.providers.linear_actions.listMyTeams
  );
  const [selectedTeams, setSelectedTeams] = useState<Set<string>>(
    () => new Set(initialScope?.teams?.map((team) => team.id) ?? [])
  );
  const [filter, setFilter] = useState("");

  const teamsQuery = useQuery({
    queryKey: ["linear-teams", connectionId],
    queryFn: () => {
      if (!connectionId) {
        return Promise.resolve([]);
      }
      return listTeams({ connectionId });
    },
    enabled: Boolean(connectionId),
  });
  const teams: LinearTeam[] | null =
    teamsQuery.data ?? (teamsQuery.isError ? [] : connectionId ? null : []);
  const loading = connectionId ? teamsQuery.isPending : false;

  const filtered = useMemo(() => {
    if (!teams) {
      return [];
    }
    const query = filter.trim().toLowerCase();
    if (!query) {
      return teams;
    }
    return teams.filter((team) => team.name.toLowerCase().includes(query));
  }, [teams, filter]);

  const toggleTeam = (id: string) => {
    setSelectedTeams((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return {
    filter,
    filtered,
    loading,
    selectedTeams,
    setFilter,
    teams,
    toggleTeam,
  };
}

function LinearTeamList({ state }: { state: LinearTeamPickerState }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Text className="font-medium" size="small">
        Teams
      </Text>
      <Input
        onChange={(event) => state.setFilter(event.target.value)}
        placeholder="Filter teams…"
        type="search"
        value={state.filter}
      />
      <div className="max-h-72 overflow-y-auto rounded-md border border-ui-border-base">
        {state.loading ? (
          <div className="px-3 py-4">
            <Text className="text-ui-fg-subtle" size="small">
              Loading teams…
            </Text>
          </div>
        ) : state.filtered.length === 0 ? (
          <div className="px-3 py-4">
            <Text className="text-ui-fg-subtle" size="small">
              {state.teams && state.teams.length === 0
                ? "No teams found on your Linear account."
                : "No teams match the filter."}
            </Text>
          </div>
        ) : (
          state.filtered.map((team) => (
            <button
              className="flex w-full cursor-pointer items-start gap-2 px-3 py-2 text-left hover:bg-ui-bg-component"
              key={team.id}
              onClick={() => state.toggleTeam(team.id)}
              type="button"
            >
              <Checkbox
                checked={state.selectedTeams.has(team.id)}
                onCheckedChange={() => state.toggleTeam(team.id)}
              />
              <Text className="font-medium" size="small">
                {team.name}
              </Text>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
