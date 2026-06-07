import type { Id } from "../_generated/dataModel";
import { internalMutation } from "../_generated/server";

const REMOVED_PROVIDERS = new Set(["readwise", "raindrop"]);
const REMOVED_SOURCES = new Set(["readwise_api", "raindrop_oauth"]);
export const verifyEncryptedTokens = internalMutation({
  args: {},
  handler: async (ctx) => {
    const connections = await ctx.db.query("connection").collect();
    const missing = connections.filter(
      (c) => c.authType === "oauth2" && !c.encryptedAccessToken
    );
    return {
      ok: missing.length === 0,
      total: connections.length,
      missingCount: missing.length,
      missingIds: missing.map((c) => c._id),
    };
  },
});
export const migrateToSyncBindings = internalMutation({
  args: {},
  handler: async (ctx) => {
    const connections = await ctx.db.query("connection").collect();
    let migrated = 0;
    for (const connection of connections) {
      const legacy = connection as {
        workspaceId?: Id<"workspace">;
        destinationCollectionId?: Id<"collection">;
        scopeSelection?: unknown;
        syncEnabled?: boolean;
        lastSyncedAt?: number;
        lastWebhookAt?: number;
      };
      if (!(legacy.syncEnabled && legacy.workspaceId)) {
        continue;
      }
      const workspaceId = legacy.workspaceId;
      if (!workspaceId) {
        continue;
      }
      const existing = await ctx.db
        .query("connectionSyncBinding")
        .withIndex("by_connection_workspace", (q) =>
          q.eq("connectionId", connection._id).eq("workspaceId", workspaceId)
        )
        .unique();
      if (!existing) {
        await ctx.db.insert("connectionSyncBinding", {
          connectionId: connection._id,
          workspaceId: legacy.workspaceId,
          scopeSelection: legacy.scopeSelection,
          destinationCollectionId: legacy.destinationCollectionId,
          syncEnabled: true,
          syncPaused: connection.status === "paused",
          lastSyncedAt: legacy.lastSyncedAt,
          lastWebhookAt: legacy.lastWebhookAt,
          createdAt: connection.createdAt,
        });
        migrated += 1;
      }
      if (legacy.scopeSelection) {
        await ctx.db.patch(connection._id, {
          webhookScope: legacy.scopeSelection,
        });
      }
    }
    return { migrated };
  },
});
export const removeReadwiseAndRaindrop = internalMutation({
  args: {},
  handler: async (ctx) => {
    const connections = await ctx.db.query("connection").collect();
    let deletedConnections = 0;
    for (const connection of connections) {
      if (REMOVED_PROVIDERS.has(connection.provider)) {
        await ctx.db.delete(connection._id);
        deletedConnections++;
      }
    }
    const importJobs = await ctx.db.query("importJob").collect();
    let deletedImportJobs = 0;
    for (const job of importJobs) {
      if (REMOVED_SOURCES.has(job.source)) {
        await ctx.db.delete(job._id);
        deletedImportJobs++;
      }
    }
    return { deletedConnections, deletedImportJobs };
  },
});
