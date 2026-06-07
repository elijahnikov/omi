import { v } from "convex/values";
import { internalQuery } from "../_generated/server";
export const listNamesForWorkspace = internalQuery({
  args: { workspaceId: v.id("workspace") },
  handler: async (ctx, args) => {
    const collections = await ctx.db
      .query("collection")
      .withIndex("by_workspace", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("deletedAt", undefined)
      )
      .collect();
    return collections.map((collection) => collection.name);
  },
});
