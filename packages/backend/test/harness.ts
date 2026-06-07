import { register as registerRateLimiter } from "@convex-dev/rate-limiter/test";
import { convexTest, type TestConvex } from "convex-test";
import { internal } from "../convex/_generated/api";
import type { Doc, Id } from "../convex/_generated/dataModel";
import betterAuthSchema from "../convex/betterAuth/schema";
import schema from "../convex/schema";

type SchemaDef = typeof schema;
type TestHarness = TestConvex<SchemaDef>;
export function createHarness(): TestHarness {
  const modules = import.meta.glob("../convex/**/*.ts");
  const t = convexTest(schema, modules);
  registerRateLimiter(t);
  const betterAuthModules = import.meta.glob("../convex/betterAuth/**/*.ts");
  t.registerComponent("betterAuth", betterAuthSchema, betterAuthModules);
  return t;
}
interface SeedUserOptions {
  email?: string;
  emailVerified?: boolean;
  username?: string;
}
export interface SeededUser {
  identity: {
    subject: string;
    userId: string;
  };
  userId: Id<"user">;
}
export async function seedUser(
  t: TestHarness,
  overrides: SeedUserOptions = {}
): Promise<SeededUser> {
  const email =
    overrides.email ??
    `test-${Math.random().toString(36).slice(2)}@example.com`;
  const username = overrides.username ?? email.split("@")[0] ?? "test";
  const userId = await t.run(async (ctx) =>
    ctx.db.insert("user", {
      email,
      username,
      emailVerified: overrides.emailVerified ?? true,
      onboardingStep: 0,
    })
  );
  return {
    userId,
    identity: { subject: userId as string, userId: userId as string },
  };
}
export async function seedWorkspace(
  t: TestHarness,
  userId: Id<"user">
): Promise<Id<"workspace">> {
  return await t.mutation(internal.workspace.mutations.seedWorkspace, {
    userId,
  });
}
export async function seedMember(
  t: TestHarness,
  workspaceId: Id<"workspace">,
  userId: Id<"user">,
  role: "admin" | "member"
): Promise<Id<"workspaceMember">> {
  return await t.run(async (ctx) =>
    ctx.db.insert("workspaceMember", {
      workspaceId,
      userId,
      role,
      lastAccessedAt: Date.now(),
    })
  );
}
export function asUser(
  t: TestHarness,
  identity: {
    subject: string;
    userId: string;
  }
): TestHarness {
  return t.withIdentity(
    identity as unknown as {
      subject: string;
    }
  ) as TestHarness;
}
export interface SeededResource {
  aiRowId: Id<"resourceAI">;
  resourceId: Id<"resource">;
}
interface SeedResourceOptions {
  aiStatus?: Doc<"resourceAI">["status"];
  title?: string;
  type?: "website" | "note" | "file";
}
export async function seedResource(
  t: TestHarness,
  workspaceId: Id<"workspace">,
  userId: Id<"user">,
  options: SeedResourceOptions = {}
): Promise<SeededResource> {
  return await t.run(async (ctx) => {
    const resourceId = await ctx.db.insert("resource", {
      workspaceId,
      createdBy: userId,
      type: options.type ?? "note",
      title: options.title ?? "Test resource",
      isFavorite: false,
      isPinned: false,
      isArchived: false,
      updatedAt: Date.now(),
    });
    const aiRowId = await ctx.db.insert("resourceAI", {
      resourceId,
      workspaceId,
      status: options.aiStatus ?? "pending",
    });
    return { resourceId, aiRowId };
  });
}
