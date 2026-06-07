import { v } from "convex/values";
import { query } from "./_generated/server";
export const getAppUserId = query({
  args: { authId: v.id("user") },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.authId);
    return doc?.userId ?? null;
  },
});
export const getAuthIdForUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("user")
      .withIndex("userId", (q) => q.eq("userId", args.userId))
      .take(1);
    return rows.at(0)?._id ?? null;
  },
});
export const getLatestSubscriptionForReference = query({
  args: { referenceId: v.string() },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("subscription")
      .withIndex("by_referenceId", (q) => q.eq("referenceId", args.referenceId))
      .collect();
    const active = rows.find(
      (r) => r.status === "active" || r.status === "trialing"
    );
    return active ?? null;
  },
});
