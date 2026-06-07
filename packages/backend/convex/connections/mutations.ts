import { ConvexError, v } from "convex/values";
import { internal } from "../_generated/api";
import { protectedMutation } from "../utils";

export const disconnect = protectedMutation({
  args: { connectionId: v.id("connection") },
  handler: async (ctx, args) => {
    const connection = await ctx.db.get(args.connectionId);
    if (!connection || connection.userId !== ctx.user._id) {
      throw new ConvexError("Connection not found");
    }
    if (connection.status === "revoked") {
      return;
    }

    await ctx.runMutation(
      internal.connections.bindings.internals.deleteBindingsForConnection,
      { connectionId: args.connectionId }
    );

    if (connection.provider === "github") {
      await ctx.db.patch(args.connectionId, {
        disconnectedAt: Date.now(),
      });
      await ctx.scheduler.runAfter(
        0,
        internal.connections.providers.github_actions.disconnectAndCleanup,
        { connectionId: args.connectionId }
      );
      return;
    }

    if (connection.provider === "linear") {
      await ctx.db.patch(args.connectionId, {
        disconnectedAt: Date.now(),
      });
      await ctx.scheduler.runAfter(
        0,
        internal.connections.providers.linear_actions.disconnectAndCleanup,
        { connectionId: args.connectionId }
      );
      return;
    }

    await ctx.db.patch(args.connectionId, {
      status: "revoked",
      encryptedAccessToken: undefined,
      encryptedRefreshToken: undefined,
      tokenKeyVersion: undefined,
      webhookSecret: undefined,
      webhookScope: undefined,
      disconnectedAt: Date.now(),
    });
  },
});

export const rename = protectedMutation({
  args: {
    connectionId: v.id("connection"),
    providerAccountLabel: v.string(),
  },
  handler: async (ctx, args) => {
    const connection = await ctx.db.get(args.connectionId);
    if (!connection || connection.userId !== ctx.user._id) {
      throw new ConvexError("Connection not found");
    }
    const trimmed = args.providerAccountLabel.trim();
    if (trimmed.length === 0 || trimmed.length > 120) {
      throw new ConvexError("Label must be 1–120 characters");
    }
    await ctx.db.patch(args.connectionId, {
      providerAccountLabel: trimmed,
    });
  },
});
