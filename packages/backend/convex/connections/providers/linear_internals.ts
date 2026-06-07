import { v } from "convex/values";
import { internalMutation, internalQuery } from "../../_generated/server";

export interface ScopedTeam {
  id: string;
  name: string;
  webhookId?: string;
}

export interface LinearWebhookScope {
  teams?: ScopedTeam[];
}

export const getConnectionForLinear = internalQuery({
  args: { connectionId: v.id("connection") },
  handler: async (
    ctx,
    args
  ): Promise<{
    encryptedAccessToken: string;
    tokenKeyVersion: number;
    webhookSecret: string | undefined;
    webhookScope: LinearWebhookScope;
  } | null> => {
    const conn = await ctx.db.get(args.connectionId);
    if (!conn || conn.provider !== "linear") {
      return null;
    }
    if (!(conn.encryptedAccessToken && conn.tokenKeyVersion)) {
      return null;
    }
    return {
      encryptedAccessToken: conn.encryptedAccessToken,
      tokenKeyVersion: conn.tokenKeyVersion,
      webhookSecret: conn.webhookSecret,
      webhookScope: (conn.webhookScope as LinearWebhookScope) ?? {},
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
      accessToken: undefined,
      refreshToken: undefined,
      encryptedAccessToken: undefined,
      encryptedRefreshToken: undefined,
      tokenKeyVersion: undefined,
      webhookSecret: undefined,
      webhookScope: undefined,
    });
  },
});

export type { LinearScopeSelection } from "../bindings/scopeHelpers";
