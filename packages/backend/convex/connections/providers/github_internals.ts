import { v } from "convex/values";
import type { Id } from "../../_generated/dataModel";
import { internalMutation, internalQuery } from "../../_generated/server";

interface ScopedRepo {
  hookId?: number;
  name: string;
}

interface GitHubWebhookScope {
  repos?: ScopedRepo[];
}

export const getConnectionForGithub = internalQuery({
  args: { connectionId: v.id("connection") },
  handler: async (
    ctx,
    args
  ): Promise<{
    encryptedAccessToken: string;
    tokenKeyVersion: number;
    webhookSecret: string | undefined;
    webhookScope: GitHubWebhookScope;
  } | null> => {
    const conn = await ctx.db.get(args.connectionId);
    if (!conn || conn.provider !== "github") {
      return null;
    }
    if (!(conn.encryptedAccessToken && conn.tokenKeyVersion)) {
      return null;
    }
    return {
      encryptedAccessToken: conn.encryptedAccessToken,
      tokenKeyVersion: conn.tokenKeyVersion,
      webhookSecret: conn.webhookSecret,
      webhookScope: (conn.webhookScope as GitHubWebhookScope) ?? {},
    };
  },
});

export const writeWebhookScope = internalMutation({
  args: {
    connectionId: v.id("connection"),
    webhookScope: v.any(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.connectionId, {
      webhookScope: args.webhookScope,
    });
  },
});

export const finalizeDisconnect = internalMutation({
  args: { connectionId: v.id("connection") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.connectionId, {
      status: "revoked",
      encryptedAccessToken: undefined,
      encryptedRefreshToken: undefined,
      tokenKeyVersion: undefined,
      webhookSecret: undefined,
      webhookScope: undefined,
    });
  },
});

export const listActiveGithubStarBindings = internalQuery({
  args: {},
  handler: async (
    ctx
  ): Promise<
    Array<{
      bindingId: Id<"connectionSyncBinding">;
      connectionId: Id<"connection">;
    }>
  > => {
    const bindings = await ctx.db
      .query("connectionSyncBinding")
      .withIndex("by_syncEnabled", (q) => q.eq("syncEnabled", true))
      .collect();
    const out: Array<{
      bindingId: Id<"connectionSyncBinding">;
      connectionId: Id<"connection">;
    }> = [];
    for (const binding of bindings) {
      if (binding.syncPaused) {
        continue;
      }
      const conn = await ctx.db.get(binding.connectionId);
      if (!conn || conn.provider !== "github" || conn.status !== "active") {
        continue;
      }
      const scope = binding.scopeSelection as
        | { starsEnabled?: boolean }
        | undefined;
      if (!scope?.starsEnabled) {
        continue;
      }
      out.push({
        bindingId: binding._id,
        connectionId: binding.connectionId,
      });
    }
    return out;
  },
});

export const writeBindingScopeSelection = internalMutation({
  args: {
    bindingId: v.id("connectionSyncBinding"),
    scopeSelection: v.any(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.bindingId, {
      scopeSelection: args.scopeSelection,
    });
  },
});

export const getBindingForGithubStars = internalQuery({
  args: { bindingId: v.id("connectionSyncBinding") },
  handler: async (ctx, args) => {
    const binding = await ctx.db.get(args.bindingId);
    if (!binding?.syncEnabled || binding.syncPaused) {
      return null;
    }
    const conn = await ctx.db.get(binding.connectionId);
    if (!conn || conn.provider !== "github") {
      return null;
    }
    if (!(conn.encryptedAccessToken && conn.tokenKeyVersion)) {
      return null;
    }
    return {
      bindingId: binding._id,
      connectionId: binding.connectionId,
      encryptedAccessToken: conn.encryptedAccessToken,
      tokenKeyVersion: conn.tokenKeyVersion,
      scopeSelection:
        (binding.scopeSelection as {
          starsEnabled?: boolean;
          starsSnapshot?: string[];
        }) ?? {},
    };
  },
});
