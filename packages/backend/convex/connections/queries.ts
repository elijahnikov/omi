import { ConvexError, v } from "convex/values";
import { protectedQuery } from "../utils";
import { getProvider, isProviderId } from "./providers/registry";

function providerSupportsSync(providerId: string): boolean {
  if (!isProviderId(providerId)) {
    return false;
  }
  try {
    return Boolean(getProvider(providerId).sync);
  } catch {
    return false;
  }
}

export const listMyConnections = protectedQuery({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("connection")
      .withIndex("by_user_provider", (q) => q.eq("userId", ctx.user._id))
      .collect();

    const result = [];
    for (const c of rows.filter((row) => row.status !== "revoked")) {
      const bindings = await ctx.db
        .query("connectionSyncBinding")
        .withIndex("by_connection", (q) => q.eq("connectionId", c._id))
        .collect();

      result.push({
        _id: c._id,
        provider: c.provider,
        authType: c.authType,
        status: c.status,
        providerAccountLabel: c.providerAccountLabel,
        providerAccountId: c.providerAccountId,
        expiresAt: c.expiresAt,
        scope: c.scope,
        lastError: c.lastError,
        lastErrorAt: c.lastErrorAt,
        supportsSync: providerSupportsSync(c.provider),
        createdAt: c.createdAt,
        syncBindings: bindings.map((b) => ({
          _id: b._id,
          workspaceId: b.workspaceId,
          syncEnabled: b.syncEnabled,
          syncPaused: b.syncPaused,
          lastSyncedAt: b.lastSyncedAt,
        })),
      });
    }
    return result;
  },
});

export const getConnection = protectedQuery({
  args: { connectionId: v.id("connection") },
  handler: async (ctx, args) => {
    const connection = await ctx.db.get(args.connectionId);
    if (!connection || connection.userId !== ctx.user._id) {
      throw new ConvexError("Connection not found");
    }
    return {
      _id: connection._id,
      provider: connection.provider,
      authType: connection.authType,
      status: connection.status,
      providerAccountLabel: connection.providerAccountLabel,
      providerAccountId: connection.providerAccountId,
      expiresAt: connection.expiresAt,
      scope: connection.scope,
      lastError: connection.lastError,
      lastErrorAt: connection.lastErrorAt,
      createdAt: connection.createdAt,
    };
  },
});
