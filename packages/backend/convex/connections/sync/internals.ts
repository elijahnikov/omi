import { ConvexError, v } from "convex/values";
import { internal } from "../../_generated/api";
import type { Doc, Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { internalMutation, internalQuery } from "../../_generated/server";
import {
  createResourceForImport,
  createSyncedResourceForImport,
} from "../../resource/mutations";
import {
  bindingIncludesGithubExternalId,
  bindingIncludesLinearTeam,
  linearTeamIds,
} from "../bindings/scopeHelpers";

const jobKindValidator = v.union(
  v.literal("backfill"),
  v.literal("delta"),
  v.literal("webhook")
);

const jobStatusValidator = v.union(
  v.literal("queued"),
  v.literal("running"),
  v.literal("completed"),
  v.literal("failed"),
  v.literal("cancelled")
);

const upsertPayload = v.object({
  externalId: v.string(),
  externalUrl: v.optional(v.string()),
  type: v.union(
    v.literal("website"),
    v.literal("note"),
    v.literal("file"),
    v.literal("synced")
  ),
  title: v.string(),
  description: v.optional(v.string()),
  note: v.optional(
    v.object({
      htmlContent: v.optional(v.string()),
      jsonContent: v.optional(v.string()),
      plainTextContent: v.optional(v.string()),
    })
  ),
  synced: v.optional(
    v.object({
      kind: v.union(v.literal("issue"), v.literal("pr"), v.literal("page")),
      externalUrl: v.string(),
      markdownContent: v.optional(v.string()),
      diffPatch: v.optional(v.string()),
      subtitle: v.optional(v.string()),
    })
  ),
  website: v.optional(
    v.object({
      url: v.string(),
      domain: v.optional(v.string()),
      favicon: v.optional(v.string()),
      ogTitle: v.optional(v.string()),
      ogDescription: v.optional(v.string()),
      ogImage: v.optional(v.string()),
      siteName: v.optional(v.string()),
      articleContent: v.optional(v.string()),
    })
  ),
});

export const createSyncJob = internalMutation({
  args: {
    connectionId: v.id("connection"),
    bindingId: v.optional(v.id("connectionSyncBinding")),
    workspaceId: v.id("workspace"),
    kind: jobKindValidator,
  },
  handler: async (ctx, args): Promise<Id<"syncJob">> => {
    return await ctx.db.insert("syncJob", {
      connectionId: args.connectionId,
      bindingId: args.bindingId,
      workspaceId: args.workspaceId,
      kind: args.kind,
      status: "running",
      startedAt: Date.now(),
      counts: { created: 0, updated: 0, skipped: 0, failed: 0 },
    });
  },
});

export const updateSyncJobProgress = internalMutation({
  args: {
    jobId: v.id("syncJob"),
    deltaCreated: v.number(),
    deltaUpdated: v.number(),
    deltaSkipped: v.number(),
    deltaFailed: v.number(),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) {
      return;
    }
    await ctx.db.patch(args.jobId, {
      counts: {
        created: job.counts.created + args.deltaCreated,
        updated: job.counts.updated + args.deltaUpdated,
        skipped: job.counts.skipped + args.deltaSkipped,
        failed: job.counts.failed + args.deltaFailed,
      },
      cursor: args.cursor ?? job.cursor,
    });
  },
});

export const finishSyncJob = internalMutation({
  args: {
    jobId: v.id("syncJob"),
    status: jobStatusValidator,
    lastError: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.jobId, {
      status: args.status,
      finishedAt: Date.now(),
      lastError: args.lastError,
    });
    const job = await ctx.db.get(args.jobId);
    if (!job) {
      return;
    }
    const now = Date.now();
    if (job.bindingId) {
      await ctx.db.patch(job.bindingId, { lastSyncedAt: now });
    }
    if (job.connectionId) {
      await ctx.db.patch(job.connectionId, {
        ...(args.status === "failed"
          ? { lastError: args.lastError, lastErrorAt: now }
          : { lastError: undefined, lastErrorAt: undefined }),
      });
    }
  },
});

export const getSyncCursor = internalQuery({
  args: {
    connectionId: v.id("connection"),
    scopeKey: v.string(),
  },
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query("syncCursor")
      .withIndex("by_connection_scope", (q) =>
        q.eq("connectionId", args.connectionId).eq("scopeKey", args.scopeKey)
      )
      .unique();
    return row?.cursor;
  },
});

export const setSyncCursor = internalMutation({
  args: {
    connectionId: v.id("connection"),
    scopeKey: v.string(),
    cursor: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("syncCursor")
      .withIndex("by_connection_scope", (q) =>
        q.eq("connectionId", args.connectionId).eq("scopeKey", args.scopeKey)
      )
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, {
        cursor: args.cursor,
        updatedAt: Date.now(),
      });
      return;
    }
    await ctx.db.insert("syncCursor", {
      connectionId: args.connectionId,
      scopeKey: args.scopeKey,
      cursor: args.cursor,
      updatedAt: Date.now(),
    });
  },
});

export const recordSyncEvent = internalMutation({
  args: {
    connectionId: v.id("connection"),
    providerEventId: v.string(),
  },
  handler: async (ctx, args): Promise<boolean> => {
    const existing = await ctx.db
      .query("syncEvent")
      .withIndex("by_connection_event", (q) =>
        q
          .eq("connectionId", args.connectionId)
          .eq("providerEventId", args.providerEventId)
      )
      .unique();
    if (existing) {
      return false;
    }
    await ctx.db.insert("syncEvent", {
      connectionId: args.connectionId,
      providerEventId: args.providerEventId,
      receivedAt: Date.now(),
    });
    return true;
  },
});

async function patchExistingResource(
  ctx: MutationCtx,
  existing: Doc<"resource">,
  upsert: {
    title: string;
    description?: string;
    externalUrl?: string;
    type: "website" | "note" | "file" | "synced";
    note?: {
      htmlContent?: string;
      plainTextContent?: string;
    };
    synced?: {
      kind: "issue" | "pr" | "page";
      externalUrl: string;
      markdownContent?: string;
      diffPatch?: string;
      subtitle?: string;
    };
    website?: {
      url: string;
      domain?: string;
      favicon?: string;
      ogTitle?: string;
      ogDescription?: string;
      ogImage?: string;
      siteName?: string;
      articleContent?: string;
    };
  }
) {
  const now = Date.now();
  await ctx.db.patch(existing._id, {
    title: upsert.title,
    description: upsert.description,
    sourceExternalUrl: upsert.externalUrl,
    updatedAt: now,
    syncedAt: now,
    deletedAt: undefined,
  });
  if (upsert.type === "synced" && upsert.synced) {
    const child = await ctx.db
      .query("syncedResource")
      .withIndex("by_resource", (q) => q.eq("resourceId", existing._id))
      .unique();
    if (child) {
      await ctx.db.replace(child._id, {
        resourceId: existing._id,
        providerId: child.providerId,
        kind: upsert.synced.kind,
        externalUrl: upsert.synced.externalUrl,
        markdownContent: upsert.synced.markdownContent,
        diffPatch: upsert.synced.diffPatch,
        subtitle: upsert.synced.subtitle,
      });
    } else if (existing.sourceProviderId) {
      await ctx.db.insert("syncedResource", {
        resourceId: existing._id,
        providerId: existing.sourceProviderId,
        kind: upsert.synced.kind,
        externalUrl: upsert.synced.externalUrl,
        markdownContent: upsert.synced.markdownContent,
        diffPatch: upsert.synced.diffPatch,
        subtitle: upsert.synced.subtitle,
      });
      if (existing.type !== "synced") {
        await ctx.db.patch(existing._id, { type: "synced" });
      }
    }
    if (upsert.synced.markdownContent) {
      const editorContent = await ctx.db
        .query("resourceContent")
        .withIndex("by_resource", (q) => q.eq("resourceId", existing._id))
        .unique();
      if (editorContent) {
        await ctx.db.replace(editorContent._id, {
          resourceId: existing._id,
          markdownContent: upsert.synced.markdownContent,
          plainTextContent: upsert.synced.markdownContent,
        });
      } else {
        await ctx.db.insert("resourceContent", {
          resourceId: existing._id,
          markdownContent: upsert.synced.markdownContent,
          plainTextContent: upsert.synced.markdownContent,
        });
      }
    }
    await ctx.scheduler.runAfter(
      0,
      internal.resource.aiActions.processResourceAI,
      { resourceId: existing._id }
    );
  } else if (upsert.type === "note" && upsert.note) {
    const child = await ctx.db
      .query("noteResource")
      .withIndex("by_resource", (q) => q.eq("resourceId", existing._id))
      .unique();
    if (child) {
      await ctx.db.replace(child._id, {
        resourceId: existing._id,
        htmlContent: upsert.note.htmlContent,
        plainTextContent: upsert.note.plainTextContent,
      });
    }
    const editorContent = await ctx.db
      .query("resourceContent")
      .withIndex("by_resource", (q) => q.eq("resourceId", existing._id))
      .unique();
    if (editorContent) {
      await ctx.db.replace(editorContent._id, {
        resourceId: existing._id,
        htmlContent: upsert.note.htmlContent,
        plainTextContent: upsert.note.plainTextContent,
      });
    } else {
      await ctx.db.insert("resourceContent", {
        resourceId: existing._id,
        htmlContent: upsert.note.htmlContent,
        plainTextContent: upsert.note.plainTextContent,
      });
    }
  } else if (upsert.type === "website" && upsert.website) {
    const child = await ctx.db
      .query("websiteResource")
      .withIndex("by_resource", (q) => q.eq("resourceId", existing._id))
      .unique();
    if (child) {
      await ctx.db.patch(child._id, {
        url: upsert.website.url,
        domain: upsert.website.domain,
        favicon: upsert.website.favicon,
        ogTitle: upsert.website.ogTitle,
        ogDescription: upsert.website.ogDescription,
        ogImage: upsert.website.ogImage,
        siteName: upsert.website.siteName,
        articleContent: upsert.website.articleContent,
        metadataStatus: "completed",
      });
    }
    if (upsert.website.articleContent) {
      const editorContent = await ctx.db
        .query("resourceContent")
        .withIndex("by_resource", (q) => q.eq("resourceId", existing._id))
        .unique();
      if (editorContent) {
        await ctx.db.replace(editorContent._id, {
          resourceId: existing._id,
          htmlContent: upsert.website.articleContent,
        });
      } else {
        await ctx.db.insert("resourceContent", {
          resourceId: existing._id,
          htmlContent: upsert.website.articleContent,
        });
      }
    }
  }
}

export const upsertSyncedResource = internalMutation({
  args: {
    bindingId: v.id("connectionSyncBinding"),
    providerId: v.string(),
    upsert: upsertPayload,
  },
  handler: async (ctx, args): Promise<"created" | "updated" | "skipped"> => {
    const binding = await ctx.db.get(args.bindingId);
    if (!binding?.syncEnabled || binding.syncPaused) {
      throw new ConvexError("Sync binding not active");
    }
    const connection = await ctx.db.get(binding.connectionId);
    if (!connection) {
      throw new ConvexError("Connection not found");
    }

    const existing = await ctx.db
      .query("resource")
      .withIndex("by_source_external", (q) =>
        q
          .eq("sourceConnectionId", binding.connectionId)
          .eq("sourceExternalId", args.upsert.externalId)
      )
      .first();

    if (existing) {
      if (existing.workspaceId !== binding.workspaceId) {
        return "skipped";
      }
      await patchExistingResource(ctx, existing, args.upsert);
      return "updated";
    }

    const importedFrom = `${args.providerId}_sync:${args.upsert.externalId}`;

    if (args.upsert.type === "synced" && args.upsert.synced) {
      const resourceId = await createSyncedResourceForImport(ctx, {
        workspaceId: binding.workspaceId,
        userId: connection.userId,
        title: args.upsert.title,
        description: args.upsert.description,
        collectionId: binding.destinationCollectionId,
        importedFrom,
        providerId: args.providerId,
        kind: args.upsert.synced.kind,
        externalUrl: args.upsert.synced.externalUrl,
        markdownContent: args.upsert.synced.markdownContent,
        diffPatch: args.upsert.synced.diffPatch,
        subtitle: args.upsert.synced.subtitle,
      });

      await ctx.db.patch(resourceId, {
        sourceConnectionId: binding.connectionId,
        sourceProviderId: args.providerId,
        sourceExternalUrl: args.upsert.externalUrl,
        sourceExternalId: args.upsert.externalId,
        syncedAt: Date.now(),
      });
      return "created";
    }

    const resourceId = await createResourceForImport(ctx, {
      workspaceId: binding.workspaceId,
      userId: connection.userId,
      type: args.upsert.type,
      title: args.upsert.title,
      description: args.upsert.description,
      url: args.upsert.website?.url,
      htmlContent:
        args.upsert.note?.htmlContent ?? args.upsert.website?.articleContent,
      jsonContent: args.upsert.note?.jsonContent,
      plainTextContent: args.upsert.note?.plainTextContent,
      collectionId: binding.destinationCollectionId,
      importedFrom,
    });

    await ctx.db.patch(resourceId, {
      sourceConnectionId: binding.connectionId,
      sourceProviderId: args.providerId,
      sourceExternalUrl: args.upsert.externalUrl,
      sourceExternalId: args.upsert.externalId,
      syncedAt: Date.now(),
    });

    if (args.upsert.type === "note" && args.upsert.note) {
      await ctx.db.insert("resourceContent", {
        resourceId,
        htmlContent: args.upsert.note.htmlContent,
        jsonContent: args.upsert.note.jsonContent,
        plainTextContent: args.upsert.note.plainTextContent,
      });
    } else if (args.upsert.type === "website" && args.upsert.website) {
      const website = args.upsert.website;
      const child = await ctx.db
        .query("websiteResource")
        .withIndex("by_resource", (q) => q.eq("resourceId", resourceId))
        .unique();
      if (child) {
        await ctx.db.patch(child._id, {
          domain: website.domain ?? child.domain,
          favicon: website.favicon,
          ogTitle: website.ogTitle,
          ogDescription: website.ogDescription,
          ogImage: website.ogImage,
          siteName: website.siteName,
          articleContent: website.articleContent,
          metadataStatus: "completed",
        });
      }
      if (website.articleContent) {
        await ctx.db.insert("resourceContent", {
          resourceId,
          htmlContent: website.articleContent,
        });
      }
    }
    return "created";
  },
});

export const tombstoneSyncedResource = internalMutation({
  args: {
    bindingId: v.id("connectionSyncBinding"),
    externalId: v.string(),
  },
  handler: async (ctx, args): Promise<boolean> => {
    const binding = await ctx.db.get(args.bindingId);
    if (!binding) {
      return false;
    }
    const existing = await ctx.db
      .query("resource")
      .withIndex("by_source_external", (q) =>
        q
          .eq("sourceConnectionId", binding.connectionId)
          .eq("sourceExternalId", args.externalId)
      )
      .first();
    if (!existing || existing.deletedAt) {
      return false;
    }
    if (existing.workspaceId !== binding.workspaceId) {
      return false;
    }
    await ctx.db.patch(existing._id, { deletedAt: Date.now() });
    return true;
  },
});

export const getActiveBindingForSync = internalQuery({
  args: { bindingId: v.id("connectionSyncBinding") },
  handler: async (ctx, args) => {
    const binding = await ctx.db.get(args.bindingId);
    if (!binding?.syncEnabled || binding.syncPaused) {
      return null;
    }
    const connection = await ctx.db.get(binding.connectionId);
    if (
      !connection ||
      connection.status !== "active" ||
      !(connection.encryptedAccessToken && connection.tokenKeyVersion)
    ) {
      return null;
    }
    return {
      bindingId: binding._id,
      connectionId: connection._id,
      provider: connection.provider,
      workspaceId: binding.workspaceId,
      scopeSelection: binding.scopeSelection,
      encryptedAccessToken: connection.encryptedAccessToken,
      tokenKeyVersion: connection.tokenKeyVersion,
      webhookSecret: connection.webhookSecret,
    };
  },
});

export const getConnectionForWebhook = internalQuery({
  args: { connectionId: v.id("connection") },
  handler: async (ctx, args) => {
    const connection = await ctx.db.get(args.connectionId);
    if (
      !connection ||
      connection.status !== "active" ||
      !(connection.encryptedAccessToken && connection.tokenKeyVersion)
    ) {
      return null;
    }
    return {
      _id: connection._id,
      provider: connection.provider,
      webhookSecret: connection.webhookSecret,
    };
  },
});

export const listMatchingBindingsForWebhook = internalQuery({
  args: {
    connectionId: v.id("connection"),
    externalId: v.string(),
    linearTeamId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const connection = await ctx.db.get(args.connectionId);
    if (!connection) {
      return [];
    }
    const bindings = await ctx.db
      .query("connectionSyncBinding")
      .withIndex("by_connection", (q) =>
        q.eq("connectionId", args.connectionId)
      )
      .collect();

    return bindings
      .filter((b) => b.syncEnabled && !b.syncPaused)
      .filter((b) => {
        if (connection.provider === "github") {
          return bindingIncludesGithubExternalId(
            b.scopeSelection,
            args.externalId
          );
        }
        if (connection.provider === "linear") {
          if (args.linearTeamId) {
            return bindingIncludesLinearTeam(
              b.scopeSelection,
              args.linearTeamId
            );
          }
          return linearTeamIds(b.scopeSelection).length > 0;
        }
        return true;
      })
      .map((b) => b._id);
  },
});

export const findConnectionByProviderAccount = internalQuery({
  args: {
    provider: v.union(
      v.literal("notion"),
      v.literal("google_drive"),
      v.literal("github"),
      v.literal("linear")
    ),
    providerAccountId: v.string(),
  },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("connection").collect();
    const match = all.find(
      (c) =>
        c.provider === args.provider &&
        c.providerAccountId === args.providerAccountId &&
        c.status === "active"
    );
    if (!match) {
      return null;
    }
    const bindings = await ctx.db
      .query("connectionSyncBinding")
      .withIndex("by_connection", (q) => q.eq("connectionId", match._id))
      .collect();
    if (!bindings.some((b) => b.syncEnabled && !b.syncPaused)) {
      return null;
    }
    return { _id: match._id };
  },
});

export const markWebhookReceived = internalMutation({
  args: {
    bindingIds: v.array(v.id("connectionSyncBinding")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    for (const bindingId of args.bindingIds) {
      await ctx.db.patch(bindingId, { lastWebhookAt: now });
    }
  },
});
