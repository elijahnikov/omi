import { v } from "convex/values";
import { internalQuery } from "../_generated/server";
export const byUserId = internalQuery({
  args: { userId: v.id("user") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }
    return { email: user.email, name: user.username };
  },
});
export const byStripeCustomerId = internalQuery({
  args: { stripeCustomerId: v.string() },
  handler: async (ctx, { stripeCustomerId }) => {
    const account = await ctx.db
      .query("billingAccount")
      .withIndex("by_stripe_customer", (q) =>
        q.eq("stripeCustomerId", stripeCustomerId)
      )
      .unique();
    if (!account) {
      return null;
    }
    const user = await ctx.db.get(account.ownerUserId);
    if (!user) {
      return null;
    }
    return { email: user.email, name: user.username };
  },
});
