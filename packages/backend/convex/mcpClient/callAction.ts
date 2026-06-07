"use node";
import { ConvexError, v } from "convex/values";
import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { type ActionCtx, action } from "../_generated/server";
import { decryptToken } from "../connections/tokens";
import { rateLimiter } from "../rateLimiter";
import { getAuthIdentity } from "../utils";
import {
  McpRpcError,
  type McpToolCallResult,
  mcpInitialize,
  mcpToolsCall,
} from "./rpc";

const REFRESH_BUFFER_MS = 60_000;
async function callToolWithSessionRetry(
  baseOptions: {
    url: string;
    bearerToken: string;
  },
  toolName: string,
  toolArgs: Record<string, unknown>
): Promise<McpToolCallResult> {
  try {
    return await mcpToolsCall(baseOptions, toolName, toolArgs);
  } catch (err) {
    if (!(err instanceof McpRpcError && isSessionRequiredError(err))) {
      throw err;
    }
    const init = await mcpInitialize(baseOptions);
    if (!init.sessionId) {
      throw err;
    }
    return await mcpToolsCall(
      { ...baseOptions, sessionId: init.sessionId },
      toolName,
      toolArgs
    );
  }
}
const SESSION_ERROR_RE = /session/i;
function isSessionRequiredError(err: McpRpcError): boolean {
  if (err.status === 400 && SESSION_ERROR_RE.test(err.message)) {
    return true;
  }
  if (err.code === -32_000 && SESSION_ERROR_RE.test(err.message)) {
    return true;
  }
  return false;
}
function sanitizeToolArgs(
  input: Record<string, unknown>
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    const cleaned = sanitizeValue(value);
    if (cleaned !== SENTINEL_OMIT) {
      out[key] = cleaned;
    }
  }
  return out;
}
const SENTINEL_OMIT = Symbol("omit");
function dropAntiPatternFilters(input: Record<string, unknown>): void {
  for (const [key, value] of Object.entries(input)) {
    if (key.toLowerCase() === "priority" && value === 0) {
      delete input[key];
      continue;
    }
    if (
      typeof value === "string" &&
      ANTI_PATTERN_FILTER_VALUES.has(value.trim().toLowerCase()) &&
      ANTI_PATTERN_FILTER_KEYS.test(key)
    ) {
      delete input[key];
      continue;
    }
    if (value && typeof value === "object" && !Array.isArray(value)) {
      dropAntiPatternFilters(value as Record<string, unknown>);
    }
  }
}
const ANTI_PATTERN_FILTER_VALUES = new Set(["all", "any", "none"]);
const ANTI_PATTERN_FILTER_KEYS =
  /^(state|status|type|category|kind|filter|scope)$/i;
function sanitizeValue(value: unknown): unknown {
  if (value === null || value === undefined) {
    return SENTINEL_OMIT;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "" || trimmed === "null" || trimmed === "undefined") {
      return SENTINEL_OMIT;
    }
    return value;
  }
  if (Array.isArray(value)) {
    const arr = value
      .map((v) => sanitizeValue(v))
      .filter((v) => v !== SENTINEL_OMIT);
    return arr;
  }
  if (typeof value === "object") {
    const cleaned = sanitizeToolArgs(value as Record<string, unknown>);
    return cleaned;
  }
  return value;
}
interface ServerForCall {
  _id: Id<"mcpServer">;
  accessTokenExpiresAt?: number;
  authType: "bearer" | "oauth2";
  enabledTools: string[];
  encryptedAccessToken?: string;
  tokenKeyVersion?: number;
  url: string;
  userId: Id<"user">;
}
async function loadActiveBearer(
  ctx: ActionCtx,
  serverId: Id<"mcpServer">
): Promise<{
  server: ServerForCall;
  bearer: string;
}> {
  let server = (await ctx.runQuery(
    internal.mcpClient.internals.getServerForCall,
    { serverId }
  )) as ServerForCall | null;
  if (!server) {
    throw new ConvexError("MCP server not found");
  }
  if (
    server.authType === "oauth2" &&
    server.accessTokenExpiresAt !== undefined &&
    server.accessTokenExpiresAt - Date.now() < REFRESH_BUFFER_MS
  ) {
    await ctx.runAction(internal.mcpClient.oauthActions.refreshAccessToken, {
      serverId,
    });
    server = (await ctx.runQuery(
      internal.mcpClient.internals.getServerForCall,
      { serverId }
    )) as ServerForCall | null;
    if (!server) {
      throw new ConvexError("MCP server disappeared after refresh");
    }
  }
  if (!server.encryptedAccessToken || server.tokenKeyVersion === undefined) {
    throw new ConvexError("MCP server has no stored access token");
  }
  const bearer = decryptToken(
    server.encryptedAccessToken,
    server.tokenKeyVersion
  );
  return { server, bearer };
}
export const callTool = action({
  args: {
    serverId: v.id("mcpServer"),
    toolName: v.string(),
    args: v.any(),
  },
  handler: async (ctx, args): Promise<McpToolCallResult> => {
    const identity = await getAuthIdentity(ctx);
    if (!identity?.userId) {
      throw new ConvexError("Unauthorized");
    }
    await rateLimiter.limit(ctx, "mcpClientCall", {
      key: args.serverId,
      throws: true,
    });
    const { server, bearer } = await loadActiveBearer(ctx, args.serverId);
    if (server.userId !== (identity.userId as Id<"user">)) {
      throw new ConvexError("MCP server not found");
    }
    if (!server.enabledTools.includes(args.toolName)) {
      return {
        content: [
          {
            type: "text",
            text: `Tool '${args.toolName}' is not enabled on this MCP server. The user can re-enable it in Omi settings.`,
          },
        ],
        isError: true,
      };
    }
    const cleanedArgs = sanitizeToolArgs(
      (args.args ?? {}) as Record<string, unknown>
    );
    dropAntiPatternFilters(cleanedArgs);
    try {
      const result = await callToolWithSessionRetry(
        { url: server.url, bearerToken: bearer },
        args.toolName,
        cleanedArgs
      );
      return result;
    } catch (err) {
      const message =
        err instanceof McpRpcError
          ? err.message
          : err instanceof Error
            ? err.message
            : "MCP tool call failed";
      if (err instanceof McpRpcError && err.isAuthError) {
        await ctx.runMutation(internal.mcpClient.internals.markServerError, {
          serverId: server._id,
          message,
        });
      }
      return {
        content: [{ type: "text", text: message }],
        isError: true,
      };
    }
  },
});
