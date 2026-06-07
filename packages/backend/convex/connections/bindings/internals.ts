import { ConvexError, v } from "convex/values";
import type { Doc, Id } from "../../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../../_generated/server";
import { internalMutation, internalQuery } from "../../_generated/server";
import {
  findScopeConflicts,
  mergeGithubRepos,
  mergeLinearTeams,
} from "./scopeHelpers";
export const listBindingsForConnectionInternal = internalQuery({
  args: { connectionId: v.id("connection") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("connectionSyncBinding")
      .withIndex("by_connection", (q) =>
        q.eq("connectionId", args.connectionId)
      )
      .collect();
  },
});
export const getBindingInternal = internalQuery({
  args: { bindingId: v.id("connectionSyncBinding") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.bindingId);
  },
});
export const deleteBindingsForConnection = internalMutation({
  args: { connectionId: v.id("connection") },
  handler: async (ctx, args) => {
    const bindings = await ctx.db
      .query("connectionSyncBinding")
      .withIndex("by_connection", (q) =>
        q.eq("connectionId", args.connectionId)
      )
      .collect();
    for (const binding of bindings) {
      await ctx.db.delete(binding._id);
    }
  },
});
export async function getActiveBindingsForConnection(
  ctx: QueryCtx | MutationCtx,
  connectionId: Id<"connection">
): Promise<Doc<"connectionSyncBinding">[]> {
  const bindings = await ctx.db
    .query("connectionSyncBinding")
    .withIndex("by_connection", (q) => q.eq("connectionId", connectionId))
    .collect();
  return bindings.filter((b) => b.syncEnabled && !b.syncPaused);
}
export async function assertScopeNoConflicts(
  ctx: QueryCtx | MutationCtx,
  connectionId: Id<"connection">,
  provider: "github" | "linear",
  newScope: unknown,
  excludeBindingId?: Id<"connectionSyncBinding">
): Promise<void> {
  const bindings = await ctx.db
    .query("connectionSyncBinding")
    .withIndex("by_connection", (q) => q.eq("connectionId", connectionId))
    .collect();
  const otherScopes = bindings
    .filter((b) => b._id !== excludeBindingId && b.syncEnabled)
    .map((b) => b.scopeSelection);
  const conflict = findScopeConflicts(otherScopes, newScope, provider);
  if (conflict) {
    throw new ConvexError(conflict);
  }
}
export function mergedWebhookTargetRepos(
  bindings: Doc<"connectionSyncBinding">[]
): string[] {
  return mergeGithubRepos(
    bindings.filter((b) => b.syncEnabled).map((b) => b.scopeSelection)
  );
}
export function mergedWebhookTargetTeamIds(
  bindings: Doc<"connectionSyncBinding">[]
): string[] {
  return mergeLinearTeams(
    bindings.filter((b) => b.syncEnabled).map((b) => b.scopeSelection)
  );
}
