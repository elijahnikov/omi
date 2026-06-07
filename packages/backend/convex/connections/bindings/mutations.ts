import { ConvexError, v } from "convex/values";
import { internal } from "../../_generated/api";
import type { Id } from "../../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../../_generated/server";
import { requirePlan } from "../../billing/resolver";
import { workspaceMutation } from "../../utils";
import {
  assertScopeNoConflicts,
  mergedWebhookTargetRepos,
  mergedWebhookTargetTeamIds,
} from "./internals";

const SYNC_PLANS = ["pro"] as const;
const WEBHOOK_SECRET_BYTES = 32;
function newWebhookSecret(): string {
  const bytes = new Uint8Array(WEBHOOK_SECRET_BYTES);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
async function ensureConnectionOwner(
  ctx: (MutationCtx | QueryCtx) & {
    user: {
      _id: Id<"user">;
    };
  },
  connectionId: Id<"connection">
) {
  const connection = await ctx.db.get(connectionId);
  if (!connection || connection.userId !== ctx.user._id) {
    throw new ConvexError("Connection not found");
  }
  if (connection.status === "revoked") {
    throw new ConvexError("Connection is revoked");
  }
  return connection;
}
async function seedDeltaCursor(
  ctx: MutationCtx,
  connectionId: Id<"connection">
) {
  const existing = await ctx.db
    .query("syncCursor")
    .withIndex("by_connection_scope", (q) =>
      q.eq("connectionId", connectionId).eq("scopeKey", "delta")
    )
    .unique();
  if (existing) {
    return;
  }
  await ctx.db.insert("syncCursor", {
    connectionId,
    scopeKey: "delta",
    cursor: "",
    updatedAt: Date.now(),
  });
}
async function scheduleInitialSync(
  ctx: MutationCtx,
  bindingId: Id<"connectionSyncBinding">,
  provider: string
) {
  if (provider !== "linear") {
    return;
  }
  await ctx.scheduler.runAfter(0, internal.connections.sync.worker.runDelta, {
    bindingId,
  });
}
async function scheduleWebhookReconcile(
  ctx: MutationCtx,
  connectionId: Id<"connection">,
  provider: string
) {
  const bindings = await ctx.runQuery(
    internal.connections.bindings.internals.listBindingsForConnectionInternal,
    { connectionId }
  );
  const active = bindings.filter((b) => b.syncEnabled && !b.syncPaused);
  if (provider === "github") {
    await ctx.scheduler.runAfter(
      0,
      internal.connections.providers.github_actions.reconcileWebhooks,
      {
        connectionId,
        targetRepos: mergedWebhookTargetRepos(active),
      }
    );
  }
  if (provider === "linear") {
    await ctx.scheduler.runAfter(
      0,
      internal.connections.providers.linear_actions.reconcileWebhooks,
      {
        connectionId,
        targetTeamIds: mergedWebhookTargetTeamIds(active),
      }
    );
  }
}
export const createSyncBinding = workspaceMutation({
  args: {
    workspaceId: v.id("workspace"),
    connectionId: v.id("connection"),
    destinationCollectionId: v.optional(v.id("collection")),
    scopeSelection: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await requirePlan(ctx, ctx.user._id, [...SYNC_PLANS], "Continuous sync");
    const connection = await ensureConnectionOwner(ctx, args.connectionId);
    if (connection.status !== "active") {
      throw new ConvexError(`Connection is ${connection.status}`);
    }
    if (args.destinationCollectionId) {
      const collection = await ctx.db.get(args.destinationCollectionId);
      if (
        !collection ||
        collection.workspaceId !== ctx.workspace._id ||
        collection.deletedAt
      ) {
        throw new ConvexError("Destination collection not found");
      }
    }
    if (connection.provider === "github" || connection.provider === "linear") {
      await assertScopeNoConflicts(
        ctx,
        args.connectionId,
        connection.provider,
        args.scopeSelection
      );
    }
    const existing = await ctx.db
      .query("connectionSyncBinding")
      .withIndex("by_connection_workspace", (q) =>
        q
          .eq("connectionId", args.connectionId)
          .eq("workspaceId", ctx.workspace._id)
      )
      .unique();
    const now = Date.now();
    let bindingId: Id<"connectionSyncBinding">;
    if (existing) {
      await ctx.db.patch(existing._id, {
        scopeSelection: args.scopeSelection,
        destinationCollectionId: args.destinationCollectionId,
        syncEnabled: true,
        syncPaused: false,
        lastSyncedAt: now,
      });
      bindingId = existing._id;
    } else {
      bindingId = await ctx.db.insert("connectionSyncBinding", {
        connectionId: args.connectionId,
        workspaceId: ctx.workspace._id,
        scopeSelection: args.scopeSelection,
        destinationCollectionId: args.destinationCollectionId,
        syncEnabled: true,
        syncPaused: false,
        lastSyncedAt: now,
        createdAt: now,
      });
    }
    if (!connection.webhookSecret) {
      await ctx.db.patch(args.connectionId, {
        webhookSecret: newWebhookSecret(),
      });
    }
    await seedDeltaCursor(ctx, args.connectionId);
    await scheduleWebhookReconcile(ctx, args.connectionId, connection.provider);
    await scheduleInitialSync(ctx, bindingId, connection.provider);
    return bindingId;
  },
});
export const setScopeSelection = workspaceMutation({
  args: {
    workspaceId: v.id("workspace"),
    bindingId: v.id("connectionSyncBinding"),
    scopeSelection: v.any(),
  },
  handler: async (ctx, args) => {
    await requirePlan(ctx, ctx.user._id, [...SYNC_PLANS], "Continuous sync");
    const binding = await ctx.db.get(args.bindingId);
    if (!binding || binding.workspaceId !== ctx.workspace._id) {
      throw new ConvexError("Sync binding not found");
    }
    const connection = await ensureConnectionOwner(ctx, binding.connectionId);
    if (connection.provider === "github" || connection.provider === "linear") {
      await assertScopeNoConflicts(
        ctx,
        binding.connectionId,
        connection.provider,
        args.scopeSelection,
        args.bindingId
      );
    }
    await ctx.db.patch(args.bindingId, {
      scopeSelection: args.scopeSelection,
    });
    await scheduleWebhookReconcile(
      ctx,
      binding.connectionId,
      connection.provider
    );
    await scheduleInitialSync(ctx, args.bindingId, connection.provider);
  },
});
export const setDestinationCollection = workspaceMutation({
  args: {
    workspaceId: v.id("workspace"),
    bindingId: v.id("connectionSyncBinding"),
    destinationCollectionId: v.optional(v.id("collection")),
  },
  handler: async (ctx, args) => {
    await requirePlan(ctx, ctx.user._id, [...SYNC_PLANS], "Continuous sync");
    const binding = await ctx.db.get(args.bindingId);
    if (!binding || binding.workspaceId !== ctx.workspace._id) {
      throw new ConvexError("Sync binding not found");
    }
    await ensureConnectionOwner(ctx, binding.connectionId);
    if (args.destinationCollectionId) {
      const collection = await ctx.db.get(args.destinationCollectionId);
      if (
        !collection ||
        collection.workspaceId !== ctx.workspace._id ||
        collection.deletedAt
      ) {
        throw new ConvexError("Destination collection not found");
      }
    }
    await ctx.db.patch(args.bindingId, {
      destinationCollectionId: args.destinationCollectionId,
    });
  },
});
export const setSyncPaused = workspaceMutation({
  args: {
    workspaceId: v.id("workspace"),
    bindingId: v.id("connectionSyncBinding"),
    paused: v.boolean(),
  },
  handler: async (ctx, args) => {
    const binding = await ctx.db.get(args.bindingId);
    if (!binding || binding.workspaceId !== ctx.workspace._id) {
      throw new ConvexError("Sync binding not found");
    }
    const connection = await ensureConnectionOwner(ctx, binding.connectionId);
    if (args.paused) {
      await ctx.db.patch(args.bindingId, { syncPaused: true });
    } else {
      await requirePlan(ctx, ctx.user._id, [...SYNC_PLANS], "Continuous sync");
      await ctx.db.patch(args.bindingId, {
        syncPaused: false,
        syncEnabled: true,
      });
    }
    await scheduleWebhookReconcile(
      ctx,
      binding.connectionId,
      connection.provider
    );
  },
});
export const triggerSyncNow = workspaceMutation({
  args: {
    workspaceId: v.id("workspace"),
    bindingId: v.id("connectionSyncBinding"),
  },
  handler: async (ctx, args) => {
    await requirePlan(ctx, ctx.user._id, [...SYNC_PLANS], "Continuous sync");
    const binding = await ctx.db.get(args.bindingId);
    if (!binding || binding.workspaceId !== ctx.workspace._id) {
      throw new ConvexError("Sync binding not found");
    }
    await ensureConnectionOwner(ctx, binding.connectionId);
    await ctx.scheduler.runAfter(0, internal.connections.sync.worker.runDelta, {
      bindingId: args.bindingId,
    });
  },
});
export const removeSyncBinding = workspaceMutation({
  args: {
    workspaceId: v.id("workspace"),
    bindingId: v.id("connectionSyncBinding"),
  },
  handler: async (ctx, args) => {
    const binding = await ctx.db.get(args.bindingId);
    if (!binding || binding.workspaceId !== ctx.workspace._id) {
      throw new ConvexError("Sync binding not found");
    }
    const connection = await ensureConnectionOwner(ctx, binding.connectionId);
    await ctx.db.delete(args.bindingId);
    await scheduleWebhookReconcile(
      ctx,
      binding.connectionId,
      connection.provider
    );
  },
});
