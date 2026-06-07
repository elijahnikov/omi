"use node";

import { ConvexError, v } from "convex/values";
import { internal } from "../../_generated/api";
import type { Id } from "../../_generated/dataModel";
import { action, internalAction } from "../../_generated/server";
import { getAuthIdentity } from "../../utils";
import { decryptToken } from "../tokens";
import { linearGraphql } from "./linear";
import type { ScopedTeam } from "./linear_internals";

const TRAILING_SLASHES_RE = /\/+$/;

function siteUrl(): string {
  const url = process.env.CONVEX_SITE_URL;
  if (!url) {
    throw new Error("CONVEX_SITE_URL not set");
  }
  return url.replace(TRAILING_SLASHES_RE, "");
}

export const reconcileWebhooks = internalAction({
  args: {
    connectionId: v.id("connection"),
    targetTeamIds: v.array(v.string()),
  },
  handler: async (ctx, args): Promise<void> => {
    const conn = await ctx.runQuery(
      internal.connections.providers.linear_internals.getConnectionForLinear,
      { connectionId: args.connectionId }
    );
    if (!conn) {
      return;
    }
    if (!conn.webhookSecret) {
      return;
    }

    await ctx.runAction(
      internal.connections.ensureFreshToken.ensureFreshAccessToken,
      { connectionId: args.connectionId }
    );
    const refreshed = await ctx.runQuery(
      internal.connections.providers.linear_internals.getConnectionForLinear,
      { connectionId: args.connectionId }
    );
    if (!refreshed) {
      return;
    }
    const accessToken = decryptToken(
      refreshed.encryptedAccessToken,
      refreshed.tokenKeyVersion
    );

    const current: ScopedTeam[] = refreshed.webhookScope.teams ?? [];
    const currentById = new Map(current.map((team) => [team.id, team]));
    const target = new Set(args.targetTeamIds);

    const toRegister = args.targetTeamIds.filter(
      (id) => !currentById.get(id)?.webhookId
    );
    const toUnregister = current.filter(
      (team) => !target.has(team.id) && team.webhookId !== undefined
    );

    const callbackUrl = `${siteUrl()}/api/integrations/linear/webhook/${args.connectionId}`;
    const registered: ScopedTeam[] = [];

    for (const teamId of toRegister) {
      const existing = currentById.get(teamId);
      try {
        const data = await linearGraphql<{
          webhookCreate: {
            success: boolean;
            webhook: { id: string } | null;
          };
        }>(
          accessToken,
          `mutation WebhookCreate($input: WebhookCreateInput!) {
            webhookCreate(input: $input) {
              success
              webhook { id enabled }
            }
          }`,
          {
            input: {
              url: callbackUrl,
              teamId,
              resourceTypes: ["Issue"],
              secret: conn.webhookSecret,
              label: "Omi sync",
            },
          }
        );
        if (data.webhookCreate.success && data.webhookCreate.webhook?.id) {
          registered.push({
            id: teamId,
            name: existing?.name ?? teamId,
            webhookId: data.webhookCreate.webhook.id,
          });
        } else {
          console.warn(
            "[linear] webhookCreate returned success=false for team",
            teamId
          );
          registered.push({
            id: teamId,
            name: existing?.name ?? teamId,
          });
        }
      } catch (err) {
        console.warn("[linear] register webhook failed", teamId, err);
        registered.push({
          id: teamId,
          name: existing?.name ?? teamId,
        });
      }
    }

    for (const team of toUnregister) {
      if (!team.webhookId) {
        continue;
      }
      try {
        await linearGraphql<{ webhookDelete: { success: boolean } }>(
          accessToken,
          `mutation WebhookDelete($id: String!) {
            webhookDelete(id: $id) { success }
          }`,
          { id: team.webhookId }
        );
      } catch (err) {
        console.warn("[linear] unregister webhook failed", team.id, err);
      }
    }

    const finalTeams: ScopedTeam[] = args.targetTeamIds.map((id) => {
      const existing = currentById.get(id);
      const newly = registered.find((team) => team.id === id);
      return {
        id,
        name: newly?.name ?? existing?.name ?? id,
        webhookId: newly?.webhookId ?? existing?.webhookId,
      };
    });

    await ctx.runMutation(
      internal.connections.providers.linear_internals.writeWebhookScope,
      {
        connectionId: args.connectionId,
        webhookScope: {
          teams: finalTeams,
        },
      }
    );
  },
});

export const listMyTeams = action({
  args: { connectionId: v.id("connection") },
  handler: async (ctx, args): Promise<Array<{ id: string; name: string }>> => {
    const identity = await getAuthIdentity(ctx);
    if (!identity?.userId) {
      throw new ConvexError("Not authenticated");
    }
    const conn = await ctx.runQuery(
      internal.connections.providers.linear_internals.getConnectionForLinear,
      { connectionId: args.connectionId }
    );
    if (!conn) {
      throw new ConvexError("Connection not found");
    }

    await ctx.runAction(
      internal.connections.ensureFreshToken.ensureFreshAccessToken,
      { connectionId: args.connectionId }
    );
    const refreshed = await ctx.runQuery(
      internal.connections.providers.linear_internals.getConnectionForLinear,
      { connectionId: args.connectionId }
    );
    if (!refreshed) {
      throw new ConvexError("Connection not found");
    }
    const accessToken = decryptToken(
      refreshed.encryptedAccessToken,
      refreshed.tokenKeyVersion
    );

    const data = await linearGraphql<{
      teams: { nodes: Array<{ id: string; name: string }> };
    }>(accessToken, "query { teams { nodes { id name } } }");
    return data.teams.nodes;
  },
});

export const disconnectAndCleanup = internalAction({
  args: { connectionId: v.id("connection") },
  handler: async (ctx, args): Promise<void> => {
    try {
      await ctx.runAction(
        internal.connections.providers.linear_actions.reconcileWebhooks,
        { connectionId: args.connectionId, targetTeamIds: [] }
      );
    } catch (err) {
      console.warn("[linear] cleanup webhooks failed", err);
    }
    await ctx.runMutation(
      internal.connections.providers.linear_internals.finalizeDisconnect,
      { connectionId: args.connectionId }
    );
  },
});
