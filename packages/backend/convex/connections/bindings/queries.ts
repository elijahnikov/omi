import { ConvexError, v } from "convex/values";
import type { Id } from "../../_generated/dataModel";
import { protectedQuery, workspaceQuery } from "../../utils";
import { getProvider, isProviderId } from "../providers/registry";
export const listBindingsForWorkspace = workspaceQuery({
  args: { workspaceId: v.id("workspace") },
  handler: async (ctx) => {
    const bindings = await ctx.db
      .query("connectionSyncBinding")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", ctx.workspace._id))
      .collect();
    const result: {
      _id: Id<"connectionSyncBinding">;
      connectionId: Id<"connection">;
      workspaceId: Id<"workspace">;
      scopeSelection?: unknown;
      destinationCollectionId?: Id<"collection">;
      syncEnabled: boolean;
      syncPaused?: boolean;
      lastSyncedAt?: number;
      lastWebhookAt?: number;
      createdAt?: number;
      provider: string;
      providerAccountLabel?: string;
      connectionStatus: string;
      lastError?: string;
      supportsSync: boolean;
    }[] = [];
    for (const binding of bindings) {
      const connection = await ctx.db.get(binding.connectionId);
      if (!connection || connection.userId !== ctx.user._id) {
        continue;
      }
      if (connection.status === "revoked") {
        continue;
      }
      result.push({
        _id: binding._id,
        connectionId: binding.connectionId,
        workspaceId: binding.workspaceId,
        scopeSelection: binding.scopeSelection,
        destinationCollectionId: binding.destinationCollectionId,
        syncEnabled: binding.syncEnabled,
        syncPaused: binding.syncPaused,
        lastSyncedAt: binding.lastSyncedAt,
        lastWebhookAt: binding.lastWebhookAt,
        createdAt: binding.createdAt,
        provider: connection.provider,
        providerAccountLabel: connection.providerAccountLabel,
        connectionStatus: connection.status,
        lastError: connection.lastError,
        supportsSync: isProviderId(connection.provider)
          ? Boolean(getProvider(connection.provider).sync)
          : false,
      });
    }
    return result;
  },
});
export const listBindingsForConnection = protectedQuery({
  args: { connectionId: v.id("connection") },
  handler: async (ctx, args) => {
    const connection = await ctx.db.get(args.connectionId);
    if (!connection || connection.userId !== ctx.user._id) {
      throw new ConvexError("Connection not found");
    }
    const bindings = await ctx.db
      .query("connectionSyncBinding")
      .withIndex("by_connection", (q) =>
        q.eq("connectionId", args.connectionId)
      )
      .collect();
    return bindings.map((b) => ({
      _id: b._id,
      workspaceId: b.workspaceId,
      scopeSelection: b.scopeSelection,
      destinationCollectionId: b.destinationCollectionId,
      syncEnabled: b.syncEnabled,
      syncPaused: b.syncPaused,
      lastSyncedAt: b.lastSyncedAt,
      createdAt: b.createdAt,
    }));
  },
});
