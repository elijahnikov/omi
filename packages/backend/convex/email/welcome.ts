import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalMutation } from "../_generated/server";

const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";

/**
 * Send the welcome email at most once per user. Called from two places — the
 * `afterEmailVerification` hook (email/password signups) and `user.onCreate`
 * for already-verified OAuth signups — so it guards on `welcomeEmailSentAt` to
 * stay idempotent.
 */
export const maybeSendWelcome = internalMutation({
  args: { userId: v.id("user") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (!user || user.welcomeEmailSentAt) {
      return;
    }
    await ctx.db.patch(userId, { welcomeEmailSentAt: Date.now() });
    await ctx.scheduler.runAfter(0, internal.email.send.sendWelcome, {
      to: user.email,
      name: user.username,
      appUrl: siteUrl,
    });
  },
});
