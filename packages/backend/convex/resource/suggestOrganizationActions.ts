"use node";

import { createOpenAIProvider } from "@omi/ai/providers";
import { generateObject, jsonSchema } from "ai";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";

const suggestionSchema = jsonSchema<{
  suggestedTags: string[];
  suggestedCollectionName: string | null;
}>({
  type: "object",
  properties: {
    suggestedTags: {
      type: "array",
      items: { type: "string" },
    },
    suggestedCollectionName: {
      type: ["string", "null"],
    },
  },
  required: ["suggestedTags", "suggestedCollectionName"],
  additionalProperties: false,
});

type SuggestResult =
  | { skipped: true; reason: string }
  | {
      skipped: false;
      tagsApplied: number;
      collection: string | null;
    };

/**
 * Auto-suggest tags and collection placement after enrichment completes.
 * Only applies when the resource has no collection and few/no tags yet.
 */
export const suggest = internalAction({
  args: {
    resourceId: v.id("resource"),
    workspaceId: v.id("workspace"),
  },
  handler: async (ctx, args): Promise<SuggestResult> => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return { skipped: true, reason: "no_api_key" };
    }

    const resource = await ctx.runQuery(
      internal.resource.aiInternals.getResourceById,
      { resourceId: args.resourceId }
    );
    if (!resource) {
      return { skipped: true, reason: "missing_resource" };
    }

    const content = await ctx.runQuery(
      internal.resource.aiInternals.getResourceContent,
      { resourceId: args.resourceId }
    );
    const resourceAI = await ctx.runQuery(
      internal.resource.aiInternals.getResourceAI,
      { resourceId: args.resourceId }
    );

    const existingTags = await ctx.runQuery(
      internal.resource.suggestOrganizationInternals.getResourceTagNames,
      { resourceId: args.resourceId }
    );

    if (resource.collectionId || existingTags.length >= 3) {
      return { skipped: true, reason: "already_organized" };
    }

    const collections = await ctx.runQuery(
      internal.collection.internals.listNamesForWorkspace,
      { workspaceId: args.workspaceId }
    );

    const provider = createOpenAIProvider(apiKey);
    const { object } = await generateObject({
      model: provider("gpt-4o-mini"),
      schema: suggestionSchema,
      prompt: `Suggest organization for this saved resource.

Title: ${resource.title}
Summary: ${resourceAI?.summary ?? "none"}
Content preview: ${JSON.stringify(content).slice(0, 1200)}
Existing tags: ${existingTags.join(", ") || "none"}
Collections: ${collections.join(", ") || "none"}

Return up to 3 new tags (lowercase, no #) and an existing collection name to place this in, or null if none fit.`,
    });

    const tagsToApply = object.suggestedTags
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag) => tag.length > 0 && !existingTags.includes(tag))
      .slice(0, 3);

    if (tagsToApply.length > 0) {
      await ctx.runMutation(
        internal.resource.linkInternals.upsertTagsForResource,
        {
          resourceId: args.resourceId,
          workspaceId: args.workspaceId,
          tags: tagsToApply,
        }
      );
    }

    if (object.suggestedCollectionName && !resource.collectionId) {
      await ctx.runMutation(
        internal.resource.suggestOrganizationInternals.applyCollectionByName,
        {
          resourceId: args.resourceId,
          workspaceId: args.workspaceId,
          collectionName: object.suggestedCollectionName,
        }
      );
    }

    return {
      skipped: false,
      tagsApplied: tagsToApply.length,
      collection: object.suggestedCollectionName,
    };
  },
});

export const suggestForImportJob = internalAction({
  args: { importJobId: v.id("importJob") },
  handler: async (ctx, args) => {
    const job = await ctx.runQuery(internal.imports.internals.getJob, {
      jobId: args.importJobId,
    });
    if (!job?.workspaceId) {
      return { scheduled: 0 };
    }

    const resources = await ctx.runQuery(
      internal.imports.internals.listResourcesForJob,
      { jobId: args.importJobId }
    );

    let scheduled = 0;
    for (const resourceId of resources.slice(0, 50)) {
      await ctx.scheduler.runAfter(
        scheduled * 2000,
        internal.resource.suggestOrganizationActions.suggest,
        {
          resourceId,
          workspaceId: job.workspaceId,
        }
      );
      scheduled += 1;
    }

    return { scheduled };
  },
});
