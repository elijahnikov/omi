"use node";
import type { GenericActionCtx } from "convex/server";
import { v } from "convex/values";
import { internal } from "../../_generated/api";
import type { DataModel, Id } from "../../_generated/dataModel";
import { internalAction } from "../../_generated/server";
import { getProvider } from "../providers/registry";
import type {
  ProviderSync,
  ResourceUpsert,
  SyncContext,
} from "../providers/types";
import { decryptToken } from "../tokens";

const providerValidator = v.union(
  v.literal("notion"),
  v.literal("google_drive"),
  v.literal("github"),
  v.literal("linear")
);
interface PreparedRun {
  bindingId: Id<"connectionSyncBinding">;
  connectionId: Id<"connection">;
  ctx: SyncContext;
  providerId: "notion" | "google_drive" | "github" | "linear";
  sync: ProviderSync;
  workspaceId: Id<"workspace">;
}
type ActionCtx = GenericActionCtx<DataModel>;
async function prepareBinding(
  ctx: ActionCtx,
  bindingId: Id<"connectionSyncBinding">
): Promise<PreparedRun | null> {
  const binding = await ctx.runQuery(
    internal.connections.sync.internals.getActiveBindingForSync,
    { bindingId }
  );
  if (!binding) {
    return null;
  }
  await ctx.runAction(
    internal.connections.ensureFreshToken.ensureFreshAccessToken,
    { connectionId: binding.connectionId }
  );
  const refreshed = await ctx.runQuery(
    internal.connections.sync.internals.getActiveBindingForSync,
    { bindingId }
  );
  if (!refreshed) {
    return null;
  }
  const descriptor = getProvider(refreshed.provider);
  if (!descriptor.sync) {
    throw new Error(`Provider ${refreshed.provider} does not support sync`);
  }
  const accessToken = decryptToken(
    refreshed.encryptedAccessToken,
    refreshed.tokenKeyVersion
  );
  return {
    bindingId: refreshed.bindingId,
    connectionId: refreshed.connectionId,
    workspaceId: refreshed.workspaceId,
    providerId: refreshed.provider,
    sync: descriptor.sync,
    ctx: {
      accessToken,
      scopeSelection: refreshed.scopeSelection,
      workspaceId: refreshed.workspaceId,
      connectionId: refreshed.connectionId,
    },
  };
}
async function applyUpserts(
  ctx: ActionCtx,
  jobId: Id<"syncJob">,
  run: PreparedRun,
  upserts: ResourceUpsert[]
): Promise<{
  created: number;
  updated: number;
  failed: number;
}> {
  let created = 0;
  let updated = 0;
  let failed = 0;
  for (const upsert of upserts) {
    try {
      const result: "created" | "updated" | "skipped" = await ctx.runMutation(
        internal.connections.sync.internals.upsertSyncedResource,
        {
          bindingId: run.bindingId,
          providerId: run.providerId,
          upsert,
        }
      );
      if (result === "created") {
        created += 1;
      } else if (result === "updated") {
        updated += 1;
      }
    } catch (err) {
      failed += 1;
      console.warn(
        "[sync] upsert failed",
        run.providerId,
        upsert.externalId,
        err
      );
    }
  }
  if (created || updated || failed) {
    await ctx.runMutation(
      internal.connections.sync.internals.updateSyncJobProgress,
      {
        jobId,
        deltaCreated: created,
        deltaUpdated: updated,
        deltaSkipped: 0,
        deltaFailed: failed,
      }
    );
  }
  return { created, updated, failed };
}
export const runDelta = internalAction({
  args: { bindingId: v.id("connectionSyncBinding") },
  handler: async (ctx, args): Promise<void> => {
    const run = await prepareBinding(ctx, args.bindingId);
    if (!run) {
      return;
    }
    const jobId: Id<"syncJob"> = await ctx.runMutation(
      internal.connections.sync.internals.createSyncJob,
      {
        connectionId: run.connectionId,
        bindingId: run.bindingId,
        workspaceId: run.workspaceId,
        kind: "delta",
      }
    );
    const cursorResult = await ctx.runQuery(
      internal.connections.sync.internals.getSyncCursor,
      { connectionId: run.connectionId, scopeKey: "delta" }
    );
    const cursor: string | undefined = cursorResult ?? undefined;
    try {
      for await (const batch of run.sync.pollDelta({ ...run.ctx, cursor })) {
        const upserts = batch.items.map((raw) =>
          run.sync.toResource(raw, run.ctx)
        );
        await applyUpserts(ctx, jobId, run, upserts);
        if (batch.cursor) {
          await ctx.runMutation(
            internal.connections.sync.internals.setSyncCursor,
            {
              connectionId: run.connectionId,
              scopeKey: "delta",
              cursor: batch.cursor,
            }
          );
        }
        if (batch.done) {
          break;
        }
      }
      await ctx.runMutation(internal.connections.sync.internals.finishSyncJob, {
        jobId,
        status: "completed",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await ctx.runMutation(internal.connections.sync.internals.finishSyncJob, {
        jobId,
        status: "failed",
        lastError: message,
      });
    }
  },
});
function extractLinearTeamId(
  rawItemJson: string | undefined
): string | undefined {
  if (!rawItemJson) {
    return undefined;
  }
  try {
    const raw = JSON.parse(rawItemJson) as {
      issue?: {
        team?: {
          id?: string;
        };
        teamId?: string;
      };
    };
    return raw.issue?.team?.id ?? raw.issue?.teamId;
  } catch {
    return undefined;
  }
}
export const applyWebhookEvent = internalAction({
  args: {
    connectionId: v.id("connection"),
    provider: providerValidator,
    kind: v.union(v.literal("upsert"), v.literal("delete")),
    externalId: v.string(),
    rawItemJson: v.optional(v.string()),
    linearTeamId: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<void> => {
    const linearTeamId =
      args.linearTeamId ?? extractLinearTeamId(args.rawItemJson);
    const bindingIds: Id<"connectionSyncBinding">[] = await ctx.runQuery(
      internal.connections.sync.internals.listMatchingBindingsForWebhook,
      {
        connectionId: args.connectionId,
        externalId: args.externalId,
        linearTeamId,
      }
    );
    if (bindingIds.length === 0) {
      return;
    }
    const firstBindingId = bindingIds[0];
    if (!firstBindingId) {
      return;
    }
    await ctx.runMutation(
      internal.connections.sync.internals.markWebhookReceived,
      { bindingIds }
    );
    const sampleBinding = await ctx.runQuery(
      internal.connections.sync.internals.getActiveBindingForSync,
      { bindingId: firstBindingId }
    );
    if (!sampleBinding) {
      return;
    }
    const descriptor = getProvider(sampleBinding.provider);
    if (!descriptor.sync) {
      return;
    }
    await ctx.runAction(
      internal.connections.ensureFreshToken.ensureFreshAccessToken,
      { connectionId: args.connectionId }
    );
    for (const bindingId of bindingIds) {
      const run = await prepareBinding(ctx, bindingId);
      if (!run) {
        continue;
      }
      if (args.kind === "delete") {
        await ctx.runMutation(
          internal.connections.sync.internals.tombstoneSyncedResource,
          { bindingId, externalId: args.externalId }
        );
        continue;
      }
      let raw: unknown = args.rawItemJson
        ? JSON.parse(args.rawItemJson)
        : undefined;
      const needsGithubRefetch =
        run.providerId === "github" &&
        args.externalId.startsWith("pr:") &&
        !(
          raw &&
          (
            raw as {
              diffPatch?: string;
            }
          ).diffPatch
        );
      if (!raw || needsGithubRefetch) {
        if (!run.sync.fetchOne) {
          throw new Error(
            `Provider ${run.providerId} sent webhook without payload and has no fetchOne`
          );
        }
        raw = await run.sync.fetchOne(run.ctx, args.externalId);
        if (!raw) {
          continue;
        }
      }
      const upsert = run.sync.toResource(raw, run.ctx);
      await ctx.runMutation(
        internal.connections.sync.internals.upsertSyncedResource,
        {
          bindingId: run.bindingId,
          providerId: run.providerId,
          upsert,
        }
      );
    }
  },
});
