import type { UserIdentity } from "convex/server";
import { ConvexError, v } from "convex/values";
import {
  customAction,
  customCtx,
  customMutation,
  customQuery,
} from "convex-helpers/server/customFunctions";
import type { Id } from "./_generated/dataModel";
import {
  type ActionCtx,
  action,
  type MutationCtx,
  mutation,
  type QueryCtx,
  query,
} from "./_generated/server";
import { authComponent } from "./auth";
import { type RateLimitName, rateLimiter } from "./rateLimiter";
export type AuthIdentity = UserIdentity & {
  userId?: string;
  sessionId?: string;
};
export const getAuthIdentity = (ctx: {
  auth: {
    getUserIdentity(): Promise<UserIdentity | null>;
  };
}) => ctx.auth.getUserIdentity() as Promise<AuthIdentity | null>;

type AuthResolverCtx = QueryCtx | MutationCtx | ActionCtx;
type UserResolverCtx = QueryCtx | MutationCtx;

export async function getResolvedAuth(
  ctx: AuthResolverCtx
): Promise<{ identity: AuthIdentity; userId: Id<"user"> } | null> {
  const identity = await getAuthIdentity(ctx);
  if (!identity) {
    return null;
  }
  if (identity.userId) {
    return {
      identity,
      userId: identity.userId as Id<"user">,
    };
  }
  const authUser = await authComponent.safeGetAuthUser(ctx);
  if (!authUser?.userId) {
    return null;
  }
  return {
    identity: { ...identity, userId: authUser.userId },
    userId: authUser.userId as Id<"user">,
  };
}

async function getResolvedUser(ctx: UserResolverCtx) {
  const auth = await getResolvedAuth(ctx);
  if (!auth) {
    throw new ConvexError("Not authenticated");
  }
  const user = await ctx.db.get(auth.userId);
  if (!user) {
    throw new ConvexError("User not found");
  }
  return { user, identity: auth.identity };
}

export function timingSafeEqualHex(left: string, right: string): boolean {
  if (left.length !== right.length) {
    return false;
  }
  let isEqual = true;
  for (let i = 0; i < left.length; i += 1) {
    if (left.charCodeAt(i) !== right.charCodeAt(i)) {
      isEqual = false;
    }
  }
  return isEqual;
}

interface ProtectedOpts {
  rateLimit?: RateLimitName;
}
type WorkspaceRole = "owner" | "admin" | "member";
interface WorkspaceOpts extends ProtectedOpts {
  role?: WorkspaceRole[];
}
export const protectedQuery = customQuery(
  query,
  customCtx(async (ctx) => {
    return await getResolvedUser(ctx);
  })
);
export const protectedMutation = customMutation(mutation, {
  args: {},
  input: async (ctx, _args, opts: ProtectedOpts = {}) => {
    const { user, identity } = await getResolvedUser(ctx);
    if (opts.rateLimit) {
      await rateLimiter.limit(ctx, opts.rateLimit, {
        key: user._id,
        throws: true,
      });
    }
    return { ctx: { user, identity }, args: {} };
  },
});
export const protectedAction = customAction(action, {
  args: {},
  input: async (ctx, _args, opts: ProtectedOpts = {}) => {
    const auth = await getResolvedAuth(ctx);
    if (!auth) {
      throw new ConvexError("Not authenticated");
    }
    if (opts.rateLimit) {
      await rateLimiter.limit(ctx, opts.rateLimit, {
        key: auth.userId,
        throws: true,
      });
    }
    return {
      ctx: { identity: auth.identity, userId: auth.userId },
      args: {},
    };
  },
});
export const workspaceQuery = customQuery(query, {
  args: { workspaceId: v.id("workspace") },
  input: async (
    ctx,
    args,
    {
      role,
    }: {
      role?: WorkspaceRole[];
    } = {}
  ) => {
    const { user, identity } = await getResolvedUser(ctx);
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) {
      throw new ConvexError("Workspace not found");
    }
    const member = await ctx.db
      .query("workspaceMember")
      .withIndex("by_workspace_user", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", user._id)
      )
      .unique();
    if (workspace.ownerId === user._id) {
      return { ctx: { user, identity, workspace, member }, args: {} };
    }
    if (!member || (role && !role.includes(member.role))) {
      throw new ConvexError("Not authorized to access this workspace");
    }
    return { ctx: { user, identity, workspace, member }, args: {} };
  },
});
export const workspaceMutation = customMutation(mutation, {
  args: { workspaceId: v.id("workspace") },
  input: async (ctx, args, opts: WorkspaceOpts = {}) => {
    const { user, identity } = await getResolvedUser(ctx);
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) {
      throw new ConvexError("Workspace not found");
    }
    const member = await ctx.db
      .query("workspaceMember")
      .withIndex("by_workspace_user", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", user._id)
      )
      .unique();
    const isOwner = workspace.ownerId === user._id;
    if (
      !isOwner &&
      (!member || (opts.role && !opts.role.includes(member.role)))
    ) {
      throw new ConvexError("Not authorized to access this workspace");
    }
    if (opts.rateLimit) {
      await rateLimiter.limit(ctx, opts.rateLimit, {
        key: user._id,
        throws: true,
      });
    }
    return { ctx: { user, identity, workspace, member }, args: {} };
  },
});
export const workspaceAction = customAction(action, {
  args: { workspaceId: v.id("workspace") },
  input: async (ctx, _args, opts: WorkspaceOpts = {}) => {
    const auth = await getResolvedAuth(ctx);
    if (!auth) {
      throw new ConvexError("Not authenticated");
    }
    if (opts.rateLimit) {
      await rateLimiter.limit(ctx, opts.rateLimit, {
        key: auth.userId,
        throws: true,
      });
    }
    return {
      ctx: { identity: auth.identity, userId: auth.userId },
      args: {},
    };
  },
});
