"use node";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";
import { refreshAccessToken } from "./oauth/tokenExchange";
import { getOAuth2Provider, isProviderId } from "./providers/registry";
import { decryptToken } from "./tokens";

const REFRESH_WINDOW_MS = 5 * 60 * 1000;
export const ensureFreshAccessToken = internalAction({
  args: { connectionId: v.id("connection") },
  handler: async (ctx, args): Promise<void> => {
    const conn = await ctx.runQuery(
      internal.connections.internals.getConnectionForTokenRefresh,
      { connectionId: args.connectionId }
    );
    if (!conn) {
      return;
    }
    if (conn.authType !== "oauth2") {
      return;
    }
    if (!(conn.encryptedRefreshToken && conn.tokenKeyVersion)) {
      return;
    }
    if (conn.expiresAt && conn.expiresAt - Date.now() > REFRESH_WINDOW_MS) {
      return;
    }
    if (!isProviderId(conn.provider)) {
      return;
    }
    const descriptor = getOAuth2Provider(conn.provider);
    const refreshTokenPlain = decryptToken(
      conn.encryptedRefreshToken,
      conn.tokenKeyVersion
    );
    const tokens = await refreshAccessToken(descriptor, refreshTokenPlain);
    await ctx.runAction(
      internal.connections.tokens.encryptAndUpdateRefreshedTokens,
      {
        connectionId: args.connectionId,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken ?? refreshTokenPlain,
        expiresAt: tokens.expiresAt,
        scope: tokens.scope,
      }
    );
  },
});
