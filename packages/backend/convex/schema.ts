import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
export default defineSchema({
  user: defineTable({
    username: v.string(),
    email: v.string(),
    emailVerified: v.boolean(),
    image: v.optional(v.string()),
    onboardedAt: v.optional(v.number()),
    onboardingStep: v.number(),
    personalBillingAccountId: v.optional(v.id("billingAccount")),
    welcomeEmailSentAt: v.optional(v.number()),
  }).index("by_email", ["email"]),
  billingAccount: defineTable({
    type: v.union(v.literal("individual")),
    ownerUserId: v.id("user"),
    plan: v.union(v.literal("free"), v.literal("basic"), v.literal("pro")),
    billingCadence: v.optional(
      v.union(v.literal("monthly"), v.literal("yearly"))
    ),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    stripePriceId: v.optional(v.string()),
    stripeCurrentPeriodEnd: v.optional(v.number()),
    subscriptionStatus: v.optional(v.string()),
    creditBalance: v.number(),
    creditResetAt: v.optional(v.number()),
    lastTopUpKey: v.optional(v.string()),
    storageBytesUsed: v.optional(v.number()),
    browserRendersThisPeriod: v.optional(v.number()),
  })
    .index("by_owner_user", ["ownerUserId"])
    .index("by_stripe_customer", ["stripeCustomerId"]),
  creditLedger: defineTable({
    billingAccountId: v.id("billingAccount"),
    workspaceId: v.optional(v.id("workspace")),
    actingUserId: v.id("user"),
    kind: v.union(
      v.literal("debit"),
      v.literal("credit"),
      v.literal("adjustment"),
      v.literal("byo-key")
    ),
    reason: v.string(),
    amount: v.number(),
    balanceAfter: v.number(),
    resourceId: v.optional(v.id("resource")),
  })
    .index("by_account_time", ["billingAccountId"])
    .index("by_workspace_time", ["workspaceId"]),
  workspaceAIProvider: defineTable({
    workspaceId: v.id("workspace"),
    provider: v.union(
      v.literal("openai"),
      v.literal("google"),
      v.literal("anthropic")
    ),
    encryptedApiKey: v.string(),
    model: v.optional(v.string()),
    createdByUserId: v.id("user"),
    lastValidatedAt: v.number(),
  }).index("by_workspaceId", ["workspaceId"]),
  workspace: defineTable({
    name: v.string(),
    ownerId: v.id("user"),
    icon: v.optional(v.string()),
    iconColor: v.optional(v.string()),
    emoji: v.optional(v.string()),
    deletedAt: v.optional(v.number()),
  })
    .index("by_owner", ["ownerId"])
    .index("by_deleted_at", ["deletedAt"]),
  workspaceMember: defineTable({
    workspaceId: v.id("workspace"),
    userId: v.id("user"),
    role: v.union(v.literal("owner"), v.literal("admin"), v.literal("member")),
    lastAccessedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_user", ["userId"])
    .index("by_user_last_accessed", ["userId", "lastAccessedAt"])
    .index("by_workspace_user", ["workspaceId", "userId"]),
  workspaceInvitation: defineTable({
    workspaceId: v.id("workspace"),
    invitedEmail: v.string(),
    invitedUserId: v.optional(v.id("user")),
    invitedByUserId: v.id("user"),
    role: v.union(v.literal("admin"), v.literal("member")),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("declined"),
      v.literal("revoked")
    ),
    token: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
    createdAt: v.number(),
    respondedAt: v.optional(v.number()),
  })
    .index("by_workspace", ["workspaceId", "status"])
    .index("by_invited_email", ["invitedEmail", "status"])
    .index("by_invited_user", ["invitedUserId", "status"])
    .index("by_workspace_email", ["workspaceId", "invitedEmail"])
    .index("by_token", ["token"]),
  resource: defineTable({
    workspaceId: v.id("workspace"),
    createdBy: v.id("user"),
    type: v.union(
      v.literal("website"),
      v.literal("note"),
      v.literal("file"),
      v.literal("synced")
    ),
    title: v.string(),
    description: v.optional(v.string()),
    isFavorite: v.boolean(),
    isPinned: v.boolean(),
    isArchived: v.boolean(),
    deletedAt: v.optional(v.number()),
    updatedAt: v.number(),
    collectionId: v.optional(v.id("collection")),
    importedFrom: v.optional(v.string()),
    dailyNoteDate: v.optional(v.string()),
    sourceConnectionId: v.optional(v.id("connection")),
    sourceProviderId: v.optional(v.string()),
    sourceExternalId: v.optional(v.string()),
    sourceExternalUrl: v.optional(v.string()),
    syncedAt: v.optional(v.number()),
  })
    .index("by_workspace", ["workspaceId", "deletedAt"])
    .index("by_workspace_imported_from", ["workspaceId", "importedFrom"])
    .index("by_source_external", ["sourceConnectionId", "sourceExternalId"])
    .index("by_workspace_dailyNoteDate", ["workspaceId", "dailyNoteDate"])
    .index("by_workspace_collection", [
      "workspaceId",
      "collectionId",
      "deletedAt",
    ])
    .index("by_workspace_collection_title", [
      "workspaceId",
      "collectionId",
      "deletedAt",
      "title",
    ])
    .index("by_workspace_collection_type", [
      "workspaceId",
      "collectionId",
      "type",
      "deletedAt",
    ])
    .index("by_workspace_collection_type_title", [
      "workspaceId",
      "collectionId",
      "type",
      "deletedAt",
      "title",
    ])
    .index("by_workspace_type", ["workspaceId", "type", "deletedAt"])
    .index("by_workspace_title", ["workspaceId", "deletedAt", "title"])
    .index("by_workspace_type_title", [
      "workspaceId",
      "type",
      "deletedAt",
      "title",
    ])
    .index("by_workspace_favorite", ["workspaceId", "isFavorite", "deletedAt"])
    .index("by_workspace_archived", ["workspaceId", "isArchived", "deletedAt"])
    .index("by_workspace_creator", ["workspaceId", "createdBy", "deletedAt"])
    .index("by_workspace_pinned", ["workspaceId", "isPinned", "deletedAt"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["workspaceId", "type", "deletedAt"],
    }),
  websiteResource: defineTable({
    resourceId: v.id("resource"),
    url: v.string(),
    domain: v.optional(v.string()),
    favicon: v.optional(v.string()),
    ogImage: v.optional(v.string()),
    ogTitle: v.optional(v.string()),
    ogDescription: v.optional(v.string()),
    siteName: v.optional(v.string()),
    articleContent: v.optional(v.string()),
    extractedLinks: v.optional(v.array(v.string())),
    contentSource: v.optional(
      v.union(
        v.literal("cloudflare"),
        v.literal("readability"),
        v.literal("embed")
      )
    ),
    fullScreenshotStorageId: v.optional(v.id("_storage")),
    isEmbeddable: v.boolean(),
    embedType: v.optional(
      v.union(
        v.literal("youtube"),
        v.literal("tweet"),
        v.literal("reddit"),
        v.literal("spotify"),
        v.literal("github_gist"),
        v.literal("codepen"),
        v.literal("vimeo"),
        v.literal("loom"),
        v.literal("figma"),
        v.literal("codesandbox"),
        v.literal("bluesky"),
        v.literal("soundcloud"),
        v.literal("google_docs"),
        v.literal("google_sheets"),
        v.literal("google_slides"),
        v.literal("notion")
      )
    ),
    embedId: v.optional(v.string()),
    metadataStatus: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    metadataError: v.optional(v.string()),
  })
    .index("by_resource", ["resourceId"])
    .index("by_domain", ["resourceId", "domain"]),
  noteResource: defineTable({
    resourceId: v.id("resource"),
    htmlContent: v.optional(v.string()),
    jsonContent: v.optional(v.string()),
    plainTextContent: v.optional(v.string()),
  }).index("by_resource", ["resourceId"]),
  resourceContent: defineTable({
    resourceId: v.id("resource"),
    htmlContent: v.optional(v.string()),
    jsonContent: v.optional(v.string()),
    plainTextContent: v.optional(v.string()),
    markdownContent: v.optional(v.string()),
  }).index("by_resource", ["resourceId"]),
  syncedResource: defineTable({
    resourceId: v.id("resource"),
    providerId: v.string(),
    kind: v.union(v.literal("issue"), v.literal("pr"), v.literal("page")),
    externalUrl: v.string(),
    markdownContent: v.optional(v.string()),
    diffPatch: v.optional(v.string()),
    subtitle: v.optional(v.string()),
  }).index("by_resource", ["resourceId"]),
  fileResource: defineTable({
    resourceId: v.id("resource"),
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileSize: v.number(),
    mimeType: v.string(),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    duration: v.optional(v.number()),
    thumbnailStorageId: v.optional(v.id("_storage")),
    extractedText: v.optional(v.string()),
  })
    .index("by_resource", ["resourceId"])
    .index("by_mime_type", ["resourceId", "mimeType"]),
  resourceAI: defineTable({
    resourceId: v.id("resource"),
    workspaceId: v.id("workspace"),
    summary: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    extractedEntities: v.optional(v.array(v.string())),
    sentiment: v.optional(v.string()),
    language: v.optional(v.string()),
    category: v.optional(v.string()),
    keyQuotes: v.optional(v.array(v.string())),
    relatedResourceIds: v.optional(v.array(v.id("resource"))),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("skipped")
    ),
    error: v.optional(v.string()),
    processedAt: v.optional(v.number()),
  })
    .index("by_resource", ["resourceId"])
    .index("by_workspace_status", ["workspaceId", "status"]),
  resourceEmbedding: defineTable({
    resourceId: v.id("resource"),
    workspaceId: v.id("workspace"),
    embedding: v.array(v.float64()),
    model: v.string(),
    inputHash: v.optional(v.string()),
  })
    .index("by_resource", ["resourceId"])
    .index("by_workspace", ["workspaceId"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 1536,
      filterFields: ["workspaceId"],
    }),
  resourceChunk: defineTable({
    resourceId: v.id("resource"),
    workspaceId: v.id("workspace"),
    chunkIndex: v.number(),
    content: v.string(),
    embedding: v.array(v.float64()),
    model: v.string(),
    startOffset: v.number(),
    endOffset: v.number(),
    metadata: v.optional(
      v.object({
        pageNumber: v.optional(v.number()),
        sectionHeader: v.optional(v.string()),
      })
    ),
    contentHash: v.string(),
  })
    .index("by_resource", ["resourceId"])
    .index("by_resource_chunk", ["resourceId", "chunkIndex"])
    .index("by_workspace", ["workspaceId"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 1536,
      filterFields: ["workspaceId"],
    }),
  userResourcePin: defineTable({
    userId: v.id("user"),
    resourceId: v.id("resource"),
    workspaceId: v.id("workspace"),
    pinnedAt: v.number(),
  })
    .index("by_user_workspace", ["userId", "workspaceId"])
    .index("by_user_resource", ["userId", "resourceId"]),
  userCollectionPin: defineTable({
    userId: v.id("user"),
    collectionId: v.id("collection"),
    workspaceId: v.id("workspace"),
    pinnedAt: v.number(),
  })
    .index("by_user_workspace", ["userId", "workspaceId"])
    .index("by_user_collection", ["userId", "collectionId"]),
  concept: defineTable({
    workspaceId: v.id("workspace"),
    name: v.string(),
    embedding: v.array(v.float64()),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_name", ["workspaceId", "name"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 1536,
      filterFields: ["workspaceId"],
    }),
  resourceConcept: defineTable({
    resourceId: v.id("resource"),
    conceptId: v.id("concept"),
    workspaceId: v.id("workspace"),
    importance: v.float64(),
  })
    .index("by_resource", ["resourceId"])
    .index("by_concept", ["conceptId"])
    .index("by_workspace", ["workspaceId"]),
  resourceLink: defineTable({
    workspaceId: v.id("workspace"),
    sourceResourceId: v.id("resource"),
    targetResourceId: v.id("resource"),
    score: v.float64(),
    conceptOverlap: v.float64(),
    semanticSimilarity: v.float64(),
    sharedConcepts: v.array(v.string()),
    status: v.union(v.literal("auto"), v.literal("pinned")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_source", ["sourceResourceId", "status"])
    .index("by_target", ["targetResourceId", "status"])
    .index("by_workspace", ["workspaceId"])
    .index("by_source_target", ["sourceResourceId", "targetResourceId"]),
  tag: defineTable({
    workspaceId: v.id("workspace"),
    name: v.string(),
    color: v.optional(v.string()),
    embedding: v.optional(v.array(v.float64())),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_name", ["workspaceId", "name"])
    .searchIndex("search_name", {
      searchField: "name",
      filterFields: ["workspaceId"],
    })
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 1536,
      filterFields: ["workspaceId"],
    }),
  collection: defineTable({
    workspaceId: v.id("workspace"),
    parentId: v.optional(v.id("collection")),
    name: v.string(),
    icon: v.optional(v.string()),
    iconColor: v.optional(v.string()),
    createdBy: v.id("user"),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_workspace", ["workspaceId", "deletedAt"])
    .index("by_workspace_parent", ["workspaceId", "parentId", "deletedAt"])
    .index("by_workspace_name", ["workspaceId", "deletedAt", "name"]),
  resourceTag: defineTable({
    resourceId: v.id("resource"),
    tagId: v.id("tag"),
    workspaceId: v.id("workspace"),
  })
    .index("by_resource", ["resourceId"])
    .index("by_tag", ["tagId"])
    .index("by_workspace_tag", ["workspaceId", "tagId"]),
  chatThread: defineTable({
    workspaceId: v.id("workspace"),
    userId: v.id("user"),
    title: v.optional(v.string()),
    resourceId: v.optional(v.id("resource")),
    lastMessageAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_workspace_user", [
      "workspaceId",
      "userId",
      "deletedAt",
      "lastMessageAt",
    ])
    .index("by_workspace_resource", ["workspaceId", "resourceId", "deletedAt"]),
  userMemory: defineTable({
    workspaceId: v.id("workspace"),
    userId: v.id("user"),
    content: v.string(),
    status: v.union(v.literal("idle"), v.literal("extracting")),
    version: v.number(),
    lastExtractedAt: v.optional(v.number()),
    lastManualEditAt: v.optional(v.number()),
    lastErrorAt: v.optional(v.number()),
    updatedAt: v.number(),
  }).index("by_user_workspace", ["workspaceId", "userId"]),
  connection: defineTable({
    userId: v.id("user"),
    provider: v.union(
      v.literal("notion"),
      v.literal("google_drive"),
      v.literal("github"),
      v.literal("linear")
    ),
    authType: v.union(v.literal("oauth2"), v.literal("api_token")),
    status: v.union(
      v.literal("active"),
      v.literal("expired"),
      v.literal("revoked"),
      v.literal("error"),
      v.literal("paused")
    ),
    encryptedAccessToken: v.optional(v.string()),
    encryptedRefreshToken: v.optional(v.string()),
    accessToken: v.optional(v.string()),
    refreshToken: v.optional(v.string()),
    tokenKeyVersion: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    scope: v.optional(v.string()),
    providerAccountId: v.optional(v.string()),
    providerAccountLabel: v.optional(v.string()),
    webhookSecret: v.optional(v.string()),
    webhookScope: v.optional(v.any()),
    webhookSubscriptionId: v.optional(v.string()),
    lastError: v.optional(v.string()),
    lastErrorAt: v.optional(v.number()),
    createdAt: v.number(),
    disconnectedAt: v.optional(v.number()),
  }).index("by_user_provider", ["userId", "provider", "status"]),
  connectionSyncBinding: defineTable({
    connectionId: v.id("connection"),
    workspaceId: v.id("workspace"),
    scopeSelection: v.optional(v.any()),
    destinationCollectionId: v.optional(v.id("collection")),
    syncEnabled: v.boolean(),
    syncPaused: v.optional(v.boolean()),
    lastSyncedAt: v.optional(v.number()),
    lastWebhookAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_connection", ["connectionId"])
    .index("by_workspace", ["workspaceId"])
    .index("by_connection_workspace", ["connectionId", "workspaceId"])
    .index("by_syncEnabled", ["syncEnabled"]),
  syncCursor: defineTable({
    connectionId: v.id("connection"),
    scopeKey: v.string(),
    cursor: v.string(),
    updatedAt: v.number(),
  }).index("by_connection_scope", ["connectionId", "scopeKey"]),
  syncJob: defineTable({
    connectionId: v.id("connection"),
    bindingId: v.optional(v.id("connectionSyncBinding")),
    workspaceId: v.id("workspace"),
    kind: v.union(
      v.literal("backfill"),
      v.literal("delta"),
      v.literal("webhook")
    ),
    status: v.union(
      v.literal("queued"),
      v.literal("running"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("cancelled")
    ),
    startedAt: v.number(),
    finishedAt: v.optional(v.number()),
    counts: v.object({
      created: v.number(),
      updated: v.number(),
      skipped: v.number(),
      failed: v.number(),
    }),
    cursor: v.optional(v.string()),
    lastError: v.optional(v.string()),
  })
    .index("by_connection_status", ["connectionId", "status"])
    .index("by_connection_started", ["connectionId", "startedAt"]),
  syncEvent: defineTable({
    connectionId: v.id("connection"),
    providerEventId: v.string(),
    receivedAt: v.number(),
  }).index("by_connection_event", ["connectionId", "providerEventId"]),
  importJob: defineTable({
    workspaceId: v.id("workspace"),
    userId: v.id("user"),
    source: v.union(
      v.literal("markdown_zip"),
      v.literal("notion_zip"),
      v.literal("evernote_enex"),
      v.literal("url_csv"),
      v.literal("bookmark_html"),
      v.literal("fabric"),
      v.literal("mymind"),
      v.literal("notion_oauth")
    ),
    uiSourceId: v.optional(v.string()),
    status: v.union(
      v.literal("uploading"),
      v.literal("queued"),
      v.literal("parsing"),
      v.literal("importing"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("cancelled")
    ),
    storageId: v.optional(v.id("_storage")),
    connectionId: v.optional(v.id("connection")),
    rootCollectionId: v.optional(v.id("collection")),
    options: v.optional(
      v.object({
        createRootCollection: v.boolean(),
        rootCollectionName: v.optional(v.string()),
        rehydrateUrls: v.boolean(),
        dedupe: v.boolean(),
        cherryPickPaths: v.optional(v.array(v.string())),
      })
    ),
    cursor: v.optional(v.string()),
    counts: v.object({
      total: v.number(),
      parsed: v.number(),
      imported: v.number(),
      skipped: v.number(),
      failed: v.number(),
    }),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    errorSummary: v.optional(v.string()),
    errorSamples: v.optional(
      v.array(v.object({ item: v.string(), error: v.string() }))
    ),
  })
    .index("by_workspace", ["workspaceId", "startedAt"])
    .index("by_user", ["userId", "startedAt"]),
  mcpServer: defineTable({
    userId: v.id("user"),
    workspaceId: v.optional(v.id("workspace")),
    name: v.string(),
    catalogId: v.optional(v.string()),
    url: v.string(),
    transport: v.literal("streamable_http"),
    authType: v.union(v.literal("bearer"), v.literal("oauth2")),
    encryptedAccessToken: v.optional(v.string()),
    encryptedRefreshToken: v.optional(v.string()),
    tokenKeyVersion: v.optional(v.number()),
    accessTokenExpiresAt: v.optional(v.number()),
    oauthClientId: v.optional(v.string()),
    encryptedOauthClientSecret: v.optional(v.string()),
    oauthAuthorizationServer: v.optional(v.string()),
    oauthTokenEndpoint: v.optional(v.string()),
    oauthScope: v.optional(v.string()),
    status: v.union(
      v.literal("active"),
      v.literal("error"),
      v.literal("disabled"),
      v.literal("pending_oauth")
    ),
    lastErrorAt: v.optional(v.number()),
    lastErrorMessage: v.optional(v.string()),
    cachedTools: v.array(
      v.object({
        name: v.string(),
        description: v.optional(v.string()),
        inputSchema: v.string(),
      })
    ),
    enabledTools: v.array(v.string()),
    instructions: v.optional(v.string()),
    toolsLastFetchedAt: v.number(),
    lastConnectedAt: v.number(),
  }).index("by_user_status", ["userId", "status"]),
  mcpOauthState: defineTable({
    state: v.string(),
    userId: v.id("user"),
    workspaceId: v.optional(v.id("workspace")),
    catalogId: v.optional(v.string()),
    name: v.string(),
    url: v.string(),
    pkceVerifier: v.string(),
    oauthClientId: v.optional(v.string()),
    encryptedOauthClientSecret: v.optional(v.string()),
    tokenKeyVersion: v.optional(v.number()),
    authorizationEndpoint: v.string(),
    tokenEndpoint: v.string(),
    authorizationServer: v.optional(v.string()),
    scope: v.optional(v.string()),
    returnTo: v.string(),
    expiresAt: v.number(),
  }).index("by_state", ["state"]),
  extensionToken: defineTable({
    userId: v.id("user"),
    defaultWorkspaceId: v.optional(v.id("workspace")),
    tokenHash: v.string(),
    label: v.string(),
    createdAt: v.number(),
    expiresAt: v.number(),
    lastUsedAt: v.optional(v.number()),
    revokedAt: v.optional(v.number()),
    kind: v.optional(v.union(v.literal("extension"), v.literal("mcp"))),
  })
    .index("by_user", ["userId", "revokedAt"])
    .index("by_hash", ["tokenHash"]),
  resourceShare: defineTable({
    resourceId: v.id("resource"),
    workspaceId: v.id("workspace"),
    slug: v.string(),
    createdBy: v.id("user"),
    createdAt: v.number(),
  })
    .index("by_resource", ["resourceId"])
    .index("by_slug", ["slug"]),
  resourceComment: defineTable({
    workspaceId: v.id("workspace"),
    resourceId: v.id("resource"),
    authorId: v.id("user"),
    content: v.string(),
    mentions: v.optional(v.array(v.id("user"))),
    createdAt: v.number(),
    editedAt: v.optional(v.number()),
    deletedAt: v.optional(v.number()),
  })
    .index("by_resource", ["resourceId", "deletedAt", "createdAt"])
    .index("by_workspace_author", ["workspaceId", "authorId"]),
  resourceCommentRead: defineTable({
    userId: v.id("user"),
    resourceId: v.id("resource"),
    workspaceId: v.id("workspace"),
    lastSeenAt: v.number(),
  }).index("by_user_resource", ["userId", "resourceId"]),
  chatMessage: defineTable({
    threadId: v.id("chatThread"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    citations: v.optional(
      v.array(
        v.object({
          resourceId: v.id("resource"),
          title: v.string(),
          type: v.string(),
          snippet: v.optional(v.string()),
          chunkIndex: v.optional(v.number()),
        })
      )
    ),
    toolParts: v.optional(v.array(v.any())),
    createdAt: v.number(),
  }).index("by_thread", ["threadId", "createdAt"]),
});
