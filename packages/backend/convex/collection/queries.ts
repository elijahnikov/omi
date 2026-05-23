import { v } from "convex/values";
import { workspaceQuery } from "../utils";

export const get = workspaceQuery({
  args: { collectionId: v.id("collection") },
  handler: async (ctx, args) => {
    const collection = await ctx.db.get(args.collectionId);
    if (
      !collection ||
      collection.workspaceId !== ctx.workspace._id ||
      collection.deletedAt
    ) {
      return null;
    }

    // Walk up parentId chain to build breadcrumbs
    const breadcrumbs: Array<{
      _id: typeof collection._id;
      name: string;
      icon?: string;
      iconColor?: string;
    }> = [];
    let current = collection;
    while (current.parentId) {
      const parent = await ctx.db.get(current.parentId);
      if (!parent || parent.deletedAt) {
        break;
      }
      breadcrumbs.unshift({
        _id: parent._id,
        name: parent.name,
        icon: parent.icon,
        iconColor: parent.iconColor,
      });
      current = parent;
    }

    return {
      _id: collection._id,
      name: collection.name,
      icon: collection.icon,
      iconColor: collection.iconColor,
      parentId: collection.parentId,
      createdBy: collection.createdBy,
      _creationTime: collection._creationTime,
      updatedAt: collection.updatedAt,
      breadcrumbs,
    };
  },
});

export const listChildren = workspaceQuery({
  args: { parentId: v.optional(v.id("collection")) },
  handler: (ctx, args) => {
    return ctx.db
      .query("collection")
      .withIndex("by_workspace_parent", (q) =>
        q
          .eq("workspaceId", ctx.workspace._id)
          .eq("parentId", args.parentId)
          .eq("deletedAt", undefined)
      )
      .collect();
  },
});

export const listAll = workspaceQuery({
  args: {},
  handler: (ctx) => {
    return ctx.db
      .query("collection")
      .withIndex("by_workspace", (q) =>
        q.eq("workspaceId", ctx.workspace._id).eq("deletedAt", undefined)
      )
      .collect();
  },
});

export const listPinned = workspaceQuery({
  args: {},
  handler: async (ctx) => {
    const pins = await ctx.db
      .query("userCollectionPin")
      .withIndex("by_user_workspace", (q) =>
        q.eq("userId", ctx.user._id).eq("workspaceId", ctx.workspace._id)
      )
      .collect();

    const collections = await Promise.all(
      pins.map(async (pin) => {
        const collection = await ctx.db.get(pin.collectionId);
        if (!collection || collection.deletedAt) {
          return null;
        }
        return collection;
      })
    );

    return collections.filter((c) => c !== null);
  },
});
