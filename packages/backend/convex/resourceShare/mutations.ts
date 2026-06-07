import { ConvexError, v } from "convex/values";
import { generateToken } from "../token";
import { workspaceMutation } from "../utils";

const MAX_SLUG_RETRIES = 5;
const generateSlug = generateToken;
export const enable = workspaceMutation({
  args: { resourceId: v.id("resource") },
  handler: async (ctx, args) => {
    const resource = await ctx.db.get(args.resourceId);
    if (!resource || resource.workspaceId !== ctx.workspace._id) {
      throw new ConvexError("Resource not found");
    }
    const existing = await ctx.db
      .query("resourceShare")
      .withIndex("by_resource", (q) => q.eq("resourceId", args.resourceId))
      .unique();
    if (existing) {
      return { slug: existing.slug };
    }
    let slug = generateSlug();
    for (let i = 0; i < MAX_SLUG_RETRIES; i++) {
      const collision = await ctx.db
        .query("resourceShare")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .unique();
      if (!collision) {
        break;
      }
      slug = generateSlug();
    }
    await ctx.db.insert("resourceShare", {
      resourceId: args.resourceId,
      workspaceId: ctx.workspace._id,
      slug,
      createdBy: ctx.user._id,
      createdAt: Date.now(),
    });
    return { slug };
  },
});
export const disable = workspaceMutation({
  args: { resourceId: v.id("resource") },
  handler: async (ctx, args) => {
    const resource = await ctx.db.get(args.resourceId);
    if (!resource || resource.workspaceId !== ctx.workspace._id) {
      throw new ConvexError("Resource not found");
    }
    const existing = await ctx.db
      .query("resourceShare")
      .withIndex("by_resource", (q) => q.eq("resourceId", args.resourceId))
      .unique();
    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});
