import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalMutation } from "../_generated/server";

const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";

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
