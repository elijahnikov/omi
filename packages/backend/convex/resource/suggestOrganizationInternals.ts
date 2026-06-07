import { v } from "convex/values";
import { internalMutation, internalQuery } from "../_generated/server";

export const getResourceTagNames = internalQuery({
  args: { resourceId: v.id("resource") },
  handler: async (ctx, args) => {
    const links = await ctx.db
      .query("resourceTag")
      .withIndex("by_resource", (q) => q.eq("resourceId", args.resourceId))
      .collect();
    const names: string[] = [];
    for (const link of links) {
      const tag = await ctx.db.get(link.tagId);
      if (tag) {
        names.push(tag.name);
      }
    }
    return names;
  },
});

export const applyCollectionByName = internalMutation({
  args: {
    resourceId: v.id("resource"),
    workspaceId: v.id("workspace"),
    collectionName: v.string(),
  },
  handler: async (ctx, args) => {
    const normalized = args.collectionName.trim();
    if (!normalized) {
      return { applied: false as const };
    }

    const resource = await ctx.db.get(args.resourceId);
    if (!resource || resource.collectionId) {
      return { applied: false as const };
    }

    const collections = await ctx.db
      .query("collection")
      .withIndex("by_workspace", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("deletedAt", undefined)
      )
      .collect();

    const match = collections.find(
      (collection) =>
        collection.name.localeCompare(normalized, undefined, {
          sensitivity: "accent",
        }) === 0
    );
    if (!match) {
      return { applied: false as const };
    }

    await ctx.db.patch(args.resourceId, {
      collectionId: match._id,
      updatedAt: Date.now(),
    });
    return { applied: true as const, collectionId: match._id };
  },
});
