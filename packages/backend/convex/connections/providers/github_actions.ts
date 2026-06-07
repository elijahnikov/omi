"use node";
import { ConvexError, v } from "convex/values";
import { internal } from "../../_generated/api";
import { action, internalAction } from "../../_generated/server";
import { getAuthIdentity } from "../../utils";
import { decryptToken } from "../tokens";

const GITHUB_API = "https://api.github.com";
const USER_AGENT = "omi-app";
interface ScopedRepo {
  hookId?: number;
  name: string;
}
interface GitHubHookResponse {
  id: number;
}
interface GitHubStarredItem {
  description: string | null;
  full_name: string;
  html_url: string;
  language: string | null;
  stargazers_count: number;
}
interface GitHubRepoListItem {
  archived?: boolean;
  description: string | null;
  fork?: boolean;
  full_name: string;
  permissions?: {
    admin?: boolean;
    push?: boolean;
    pull?: boolean;
  };
  private: boolean;
}
const TRAILING_SLASHES_RE = /\/+$/;
function siteUrl(): string {
  const url = process.env.CONVEX_SITE_URL;
  if (!url) {
    throw new Error("CONVEX_SITE_URL not set");
  }
  return url.replace(TRAILING_SLASHES_RE, "");
}
async function ghFetch<T>(
  url: string,
  accessToken: string,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${accessToken}`,
      "User-Agent": USER_AGENT,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.headers ?? {}),
    },
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `GitHub ${init?.method ?? "GET"} ${url} ${response.status}: ${body.slice(0, 200)}`
    );
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}
async function ghDelete(url: string, accessToken: string): Promise<void> {
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${accessToken}`,
      "User-Agent": USER_AGENT,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!response.ok && response.status !== 404) {
    const body = await response.text();
    throw new Error(
      `GitHub DELETE ${url} ${response.status}: ${body.slice(0, 200)}`
    );
  }
}
export const reconcileWebhooks = internalAction({
  args: {
    connectionId: v.id("connection"),
    targetRepos: v.array(v.string()),
  },
  handler: async (ctx, args): Promise<void> => {
    const conn = await ctx.runQuery(
      internal.connections.providers.github_internals.getConnectionForGithub,
      { connectionId: args.connectionId }
    );
    if (!conn) {
      return;
    }
    if (!conn.webhookSecret) {
      return;
    }
    const accessToken = decryptToken(
      conn.encryptedAccessToken,
      conn.tokenKeyVersion
    );
    const current: ScopedRepo[] = conn.webhookScope.repos ?? [];
    const currentByName = new Map(current.map((r) => [r.name, r]));
    const target = new Set(args.targetRepos);
    const toRegister = args.targetRepos.filter(
      (n) => !currentByName.get(n)?.hookId
    );
    const toUnregister = current.filter(
      (r) => !target.has(r.name) && r.hookId !== undefined
    );
    const callbackUrl = `${siteUrl()}/api/integrations/github/webhook/${args.connectionId}`;
    const registered: ScopedRepo[] = [];
    for (const repo of toRegister) {
      try {
        const hook = await ghFetch<GitHubHookResponse>(
          `${GITHUB_API}/repos/${repo}/hooks`,
          accessToken,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: "web",
              active: true,
              events: ["issues", "pull_request"],
              config: {
                url: callbackUrl,
                content_type: "json",
                secret: conn.webhookSecret,
                insecure_ssl: "0",
              },
            }),
          }
        );
        registered.push({ name: repo, hookId: hook.id });
      } catch (err) {
        console.warn("[github] register webhook failed", repo, err);
        registered.push({ name: repo });
      }
    }
    for (const repo of toUnregister) {
      if (!repo.hookId) {
        continue;
      }
      try {
        await ghDelete(
          `${GITHUB_API}/repos/${repo.name}/hooks/${repo.hookId}`,
          accessToken
        );
      } catch (err) {
        console.warn("[github] unregister webhook failed", repo.name, err);
      }
    }
    const finalRepos: ScopedRepo[] = args.targetRepos.map((name) => {
      const existing = currentByName.get(name);
      const newly = registered.find((r) => r.name === name);
      return {
        name,
        hookId: newly?.hookId ?? existing?.hookId,
      };
    });
    await ctx.runMutation(
      internal.connections.providers.github_internals.writeWebhookScope,
      {
        connectionId: args.connectionId,
        webhookScope: {
          repos: finalRepos,
        },
      }
    );
  },
});
export const listMyRepos = action({
  args: { connectionId: v.id("connection") },
  handler: async (
    ctx,
    args
  ): Promise<
    Array<{
      fullName: string;
      private: boolean;
      description: string | null;
    }>
  > => {
    const identity = await getAuthIdentity(ctx);
    if (!identity?.userId) {
      throw new ConvexError("Not authenticated");
    }
    const conn = await ctx.runQuery(
      internal.connections.providers.github_internals.getConnectionForGithub,
      { connectionId: args.connectionId }
    );
    if (!conn) {
      throw new ConvexError("Connection not found");
    }
    const accessToken = decryptToken(
      conn.encryptedAccessToken,
      conn.tokenKeyVersion
    );
    const PER_PAGE = 100;
    const PAGES = 3;
    const out: Array<{
      fullName: string;
      private: boolean;
      description: string | null;
    }> = [];
    for (let page = 1; page <= PAGES; page += 1) {
      const batch = await ghFetch<GitHubRepoListItem[]>(
        `${GITHUB_API}/user/repos?per_page=${PER_PAGE}&page=${page}&sort=updated&affiliation=owner,collaborator,organization_member`,
        accessToken
      );
      for (const r of batch) {
        if (r.archived) {
          continue;
        }
        if (r.permissions && r.permissions.admin === false) {
          continue;
        }
        out.push({
          fullName: r.full_name,
          private: r.private,
          description: r.description,
        });
      }
      if (batch.length < PER_PAGE) {
        break;
      }
    }
    return out;
  },
});
export const disconnectAndCleanup = internalAction({
  args: { connectionId: v.id("connection") },
  handler: async (ctx, args): Promise<void> => {
    try {
      await ctx.runAction(
        internal.connections.providers.github_actions.reconcileWebhooks,
        { connectionId: args.connectionId, targetRepos: [] }
      );
    } catch (err) {
      console.warn("[github] cleanup webhooks failed", err);
    }
    await ctx.runMutation(
      internal.connections.providers.github_internals.finalizeDisconnect,
      { connectionId: args.connectionId }
    );
  },
});
export const pollAllStars = internalAction({
  args: {},
  handler: async (ctx): Promise<void> => {
    const targets = await ctx.runQuery(
      internal.connections.providers.github_internals
        .listActiveGithubStarBindings,
      {}
    );
    for (const { bindingId } of targets) {
      try {
        await ctx.runAction(
          internal.connections.providers.github_actions.pollStarsForBinding,
          { bindingId }
        );
      } catch (err) {
        console.warn("[github] pollStars failed", bindingId, err);
      }
    }
  },
});
export const pollStarsForBinding = internalAction({
  args: { bindingId: v.id("connectionSyncBinding") },
  handler: async (ctx, args): Promise<void> => {
    const conn = await ctx.runQuery(
      internal.connections.providers.github_internals.getBindingForGithubStars,
      { bindingId: args.bindingId }
    );
    if (!conn?.scopeSelection.starsEnabled) {
      return;
    }
    const accessToken = decryptToken(
      conn.encryptedAccessToken,
      conn.tokenKeyVersion
    );
    const PAGES = 2;
    const PER_PAGE = 100;
    const items: GitHubStarredItem[] = [];
    for (let page = 1; page <= PAGES; page += 1) {
      const batch = await ghFetch<GitHubStarredItem[]>(
        `${GITHUB_API}/user/starred?per_page=${PER_PAGE}&page=${page}`,
        accessToken
      );
      items.push(...batch);
      if (batch.length < PER_PAGE) {
        break;
      }
    }
    const previousSnapshot = new Set(conn.scopeSelection.starsSnapshot ?? []);
    const isFirstRun = (conn.scopeSelection.starsSnapshot ?? null) === null;
    const currentNames = items.map((i) => i.full_name);
    const currentSet = new Set(currentNames);
    if (isFirstRun) {
      await ctx.runMutation(
        internal.connections.providers.github_internals
          .writeBindingScopeSelection,
        {
          bindingId: args.bindingId,
          scopeSelection: {
            ...conn.scopeSelection,
            starsSnapshot: currentNames,
          },
        }
      );
      return;
    }
    const added = items.filter((i) => !previousSnapshot.has(i.full_name));
    const removed = [...previousSnapshot].filter(
      (n): n is string => typeof n === "string" && !currentSet.has(n)
    );
    for (const repo of added) {
      try {
        await ctx.runMutation(
          internal.connections.sync.internals.upsertSyncedResource,
          {
            bindingId: args.bindingId,
            providerId: "github",
            upsert: {
              externalId: `star:${repo.full_name}`,
              externalUrl: repo.html_url,
              type: "website",
              title: repo.full_name,
              description: repo.description ?? "Starred repo",
              website: {
                url: repo.html_url,
                domain: "github.com",
                ogTitle: repo.full_name,
                ogDescription: repo.description ?? undefined,
                siteName: "GitHub",
              },
            },
          }
        );
      } catch (err) {
        console.warn("[github] star upsert failed", repo.full_name, err);
      }
    }
    for (const fullName of removed) {
      try {
        await ctx.runMutation(
          internal.connections.sync.internals.tombstoneSyncedResource,
          {
            bindingId: args.bindingId,
            externalId: `star:${fullName}`,
          }
        );
      } catch (err) {
        console.warn("[github] star tombstone failed", fullName, err);
      }
    }
    await ctx.runMutation(
      internal.connections.providers.github_internals
        .writeBindingScopeSelection,
      {
        bindingId: args.bindingId,
        scopeSelection: {
          ...conn.scopeSelection,
          starsSnapshot: currentNames,
        },
      }
    );
  },
});
