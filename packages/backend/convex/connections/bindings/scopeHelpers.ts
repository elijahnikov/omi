interface GitHubScopeSelection {
  repos?: Array<{ hookId?: number; name: string }>;
  starsEnabled?: boolean;
  starsSnapshot?: string[];
}

interface LinearScopeSelection {
  teams?: Array<{ id: string; name: string; webhookId?: string }>;
}

export function githubRepoNames(scope: unknown): string[] {
  const s = scope as GitHubScopeSelection | undefined;
  return s?.repos?.map((r) => r.name) ?? [];
}

export function linearTeamIds(scope: unknown): string[] {
  const s = scope as LinearScopeSelection | undefined;
  return s?.teams?.map((team) => team.id) ?? [];
}

export function mergeGithubRepos(scopes: unknown[]): string[] {
  const repos = new Set<string>();
  for (const scope of scopes) {
    for (const name of githubRepoNames(scope)) {
      repos.add(name);
    }
  }
  return [...repos];
}

export function mergeLinearTeams(scopes: unknown[]): string[] {
  const teams = new Set<string>();
  for (const scope of scopes) {
    for (const id of linearTeamIds(scope)) {
      teams.add(id);
    }
  }
  return [...teams];
}

export function githubRepoFromExternalId(externalId: string): string | null {
  const match = externalId.match(/^(?:issue|pr|star):([^/]+)\/([^/]+)/);
  if (!match) {
    return null;
  }
  return `${match[1]}/${match[2]}`;
}

export function bindingIncludesGithubExternalId(
  scope: unknown,
  externalId: string
): boolean {
  if (externalId.startsWith("star:")) {
    const s = scope as GitHubScopeSelection | undefined;
    return Boolean(s?.starsEnabled);
  }
  const repo = githubRepoFromExternalId(externalId);
  if (!repo) {
    return false;
  }
  return githubRepoNames(scope).includes(repo);
}

export function bindingIncludesLinearTeam(
  scope: unknown,
  teamId: string
): boolean {
  return linearTeamIds(scope).includes(teamId);
}

export function findScopeConflicts(
  existingScopes: unknown[],
  newScope: unknown,
  provider: "github" | "linear"
): string | null {
  if (provider === "github") {
    const newSelection = newScope as GitHubScopeSelection | undefined;
    if (newSelection?.starsEnabled) {
      for (const scope of existingScopes) {
        if ((scope as GitHubScopeSelection | undefined)?.starsEnabled) {
          return "Star tracking is already enabled for another workspace";
        }
      }
    }
    const newRepos = new Set(githubRepoNames(newScope));
    for (const scope of existingScopes) {
      for (const repo of githubRepoNames(scope)) {
        if (newRepos.has(repo)) {
          return `Repository "${repo}" is already syncing to another workspace`;
        }
      }
    }
    return null;
  }
  const newTeams = new Set(linearTeamIds(newScope));
  for (const scope of existingScopes) {
    for (const teamId of linearTeamIds(scope)) {
      if (newTeams.has(teamId)) {
        return "Team is already syncing to another workspace";
      }
    }
  }
  return null;
}

export type { GitHubScopeSelection, LinearScopeSelection };
