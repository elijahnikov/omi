import { v } from "convex/values";
import { internalMutation } from "../_generated/server";

/**
 * Legacy migration helpers. Plaintext token columns were removed from schema after
 * encryptTokensMigrationAction:run completed in production.
 *
 * Before deploy: npx convex run connections/encryptTokensMigrationAction:run
 * After deploy: npx convex run connections/migrations:verifyEncryptedTokens
 */

export const writeEncryptedTokens = internalMutation({
  args: {
    connectionId: v.id("connection"),
    encryptedAccessToken: v.string(),
    encryptedRefreshToken: v.optional(v.string()),
    tokenKeyVersion: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.connectionId, {
      encryptedAccessToken: args.encryptedAccessToken,
      encryptedRefreshToken: args.encryptedRefreshToken,
      tokenKeyVersion: args.tokenKeyVersion,
    });
  },
});
