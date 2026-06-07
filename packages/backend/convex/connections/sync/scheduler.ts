import { internal } from "../../_generated/api";
import { internalAction, internalMutation } from "../../_generated/server";

const POLL_INTERVAL_MS = 6 * 60 * 60 * 1000;
const IDLE_PAUSE_MS = 14 * 24 * 60 * 60 * 1000;

export const enqueueDeltaPolls = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const bindings = await ctx.db
      .query("connectionSyncBinding")
      .withIndex("by_syncEnabled", (q) => q.eq("syncEnabled", true))
      .collect();

    let scheduled = 0;
    for (const binding of bindings) {
      if (binding.syncPaused) {
        continue;
      }

      const connection = await ctx.db.get(binding.connectionId);
      if (!connection || connection.status !== "active") {
        continue;
      }

      const lastAccess = await ctx.db
        .query("workspaceMember")
        .withIndex("by_workspace", (q) =>
          q.eq("workspaceId", binding.workspaceId)
        )
        .collect();
      const mostRecentAccess = lastAccess.reduce(
        (max, m) => Math.max(max, m.lastAccessedAt),
        0
      );
      if (mostRecentAccess && now - mostRecentAccess > IDLE_PAUSE_MS) {
        continue;
      }

      const webhookFresh =
        binding.lastWebhookAt && now - binding.lastWebhookAt < POLL_INTERVAL_MS;
      if (webhookFresh) {
        continue;
      }

      await ctx.scheduler.runAfter(
        0,
        internal.connections.sync.worker.runDelta,
        { bindingId: binding._id }
      );
      scheduled += 1;
    }
    return { scheduled };
  },
});

export const pauseDowngradedConnections = internalAction({
  args: {},
  handler: async (ctx): Promise<{ paused: number }> => {
    const result = await ctx.runMutation(
      internal.connections.sync.scheduler.runPauseDowngraded,
      {}
    );
    return result;
  },
});

export const runPauseDowngraded = internalMutation({
  args: {},
  handler: async (ctx): Promise<{ paused: number }> => {
    const bindings = await ctx.db
      .query("connectionSyncBinding")
      .withIndex("by_syncEnabled", (q) => q.eq("syncEnabled", true))
      .collect();

    let paused = 0;
    for (const binding of bindings) {
      const connection = await ctx.db.get(binding.connectionId);
      if (!connection) {
        continue;
      }
      const user = await ctx.db.get(connection.userId);
      if (!user?.personalBillingAccountId) {
        continue;
      }
      const account = await ctx.db.get(user.personalBillingAccountId);
      if (!account || account.plan === "pro") {
        continue;
      }
      await ctx.db.patch(binding._id, { syncPaused: true });
      paused += 1;
    }
    return { paused };
  },
});
