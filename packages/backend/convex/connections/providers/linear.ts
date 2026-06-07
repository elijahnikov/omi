import { linearTeamIds } from "../bindings/scopeHelpers";
import type {
  OAuth2ProviderDescriptor,
  ProviderSync,
  ResourceUpsert,
  WebhookEvent,
  WebhookParseResult,
} from "./types";

const LINEAR_GRAPHQL = "https://api.linear.app/graphql";

export interface LinearIssue {
  description?: string | null;
  id: string;
  identifier?: string;
  state?: { name?: string | null } | null;
  teamId?: string;
  title: string;
  url: string;
}

interface LinearWebhookPayload {
  action: "create" | "update" | "remove";
  data: LinearIssue & { teamId?: string };
  type: string;
  webhookTimestamp?: number;
}

export interface LinearIssueRawItem {
  issue: LinearIssue;
}

function externalIdFor(issueId: string): string {
  return `issue:${issueId}`;
}

const EXTERNAL_ID_RE = /^issue:(.+)$/;
function parseExternalId(externalId: string): string | null {
  const match = externalId.match(EXTERNAL_ID_RE);
  return match?.[1] ?? null;
}

async function verifyLinearSignature(
  body: string,
  signatureHeader: string | null,
  secret: string
): Promise<boolean> {
  if (!signatureHeader) {
    return false;
  }
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(body)
  );
  const hex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  if (hex.length !== signatureHeader.length) {
    return false;
  }
  let mismatch = 0;
  for (let i = 0; i < hex.length; i += 1) {
    // biome-ignore lint/suspicious/noBitwiseOperators: timing-safe compare
    mismatch |= hex.charCodeAt(i) ^ signatureHeader.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function linearGraphql<T>(
  accessToken: string,
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const response = await fetch(LINEAR_GRAPHQL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(
      `Linear GraphQL HTTP ${response.status}: ${text.slice(0, 200)}`
    );
  }
  const parsed = JSON.parse(text) as {
    data?: T;
    errors?: Array<{ message: string }>;
  };
  if (parsed.errors?.length) {
    throw new Error(parsed.errors.map((e) => e.message).join("; "));
  }
  if (!parsed.data) {
    throw new Error("Linear GraphQL returned no data");
  }
  return parsed.data;
}

const ISSUES_PAGE_QUERY = `query TeamIssues($teamId: String!, $after: String) {
  team(id: $teamId) {
    issues(first: 50, after: $after) {
      nodes {
        id
        title
        description
        url
        identifier
        teamId
        state { name }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
}`;

const linearSync: ProviderSync = {
  kind: "hybrid",

  async *pollDelta(ctx) {
    const teamIds = linearTeamIds(ctx.scopeSelection);
    if (teamIds.length === 0) {
      yield { items: [], done: true };
      return;
    }

    for (const teamId of teamIds) {
      let after: string | undefined;
      let hasNextPage = true;
      while (hasNextPage) {
        const data = await linearGraphql<{
          team: {
            issues: {
              nodes: LinearIssue[];
              pageInfo: { hasNextPage: boolean; endCursor: string | null };
            };
          } | null;
        }>(ctx.accessToken, ISSUES_PAGE_QUERY, {
          teamId,
          after: after ?? null,
        });
        const page = data.team?.issues;
        if (!page) {
          break;
        }
        yield {
          items: page.nodes.map(
            (issue) => ({ issue }) satisfies LinearIssueRawItem
          ),
          done: false,
        };
        hasNextPage = page.pageInfo.hasNextPage;
        after = page.pageInfo.endCursor ?? undefined;
      }
    }
    yield { items: [], done: true };
  },

  async parseWebhook(req, secret): Promise<WebhookParseResult | null> {
    const body = await req.text();
    if (!secret) {
      console.warn("[linear] webhook handler missing per-connection secret");
      return null;
    }
    const ok = await verifyLinearSignature(
      body,
      req.headers.get("Linear-Signature"),
      secret
    );
    if (!ok) {
      return null;
    }

    let payload: LinearWebhookPayload;
    try {
      payload = JSON.parse(body) as LinearWebhookPayload;
    } catch {
      return null;
    }

    if (
      payload.webhookTimestamp &&
      Math.abs(Date.now() - payload.webhookTimestamp) > 60_000
    ) {
      return null;
    }

    if (payload.type !== "Issue" || !payload.data?.id) {
      return { kind: "events", events: [] };
    }

    const deliveryId =
      req.headers.get("Linear-Delivery") ?? `${Date.now()}:${Math.random()}`;
    const isDelete = payload.action === "remove";
    const events: WebhookEvent[] = [
      {
        kind: isDelete ? "delete" : "upsert",
        externalId: externalIdFor(payload.data.id),
        eventId: deliveryId,
        rawItem: { issue: payload.data } satisfies LinearIssueRawItem,
      },
    ];
    return { kind: "events", events };
  },

  async fetchOne(ctx, externalId): Promise<unknown | null> {
    const issueId = parseExternalId(externalId);
    if (!issueId) {
      return null;
    }
    try {
      const data = await linearGraphql<{ issue: LinearIssue | null }>(
        ctx.accessToken,
        `query Issue($id: String!) {
          issue(id: $id) {
            id
            title
            description
            url
            identifier
            teamId
            state { name }
          }
        }`,
        { id: issueId }
      );
      if (!data.issue) {
        return null;
      }
      return { issue: data.issue } satisfies LinearIssueRawItem;
    } catch {
      return null;
    }
  },

  toResource(rawItem): ResourceUpsert {
    const item = rawItem as LinearIssueRawItem;
    const issue = item.issue;
    const state = issue.state?.name ?? "unknown";
    const identifier = issue.identifier ?? issue.id.slice(0, 8);
    const subtitle = `${identifier} · ${state}`;

    return {
      externalId: externalIdFor(issue.id),
      externalUrl: issue.url,
      type: "synced",
      title: issue.title,
      description: subtitle,
      synced: {
        kind: "issue",
        externalUrl: issue.url,
        markdownContent: issue.description ?? undefined,
        subtitle,
      },
    };
  },
};

export const linear: OAuth2ProviderDescriptor = {
  id: "linear",
  label: "Linear",
  authType: "oauth2",
  authorizeUrl: "https://linear.app/oauth/authorize",
  tokenUrl: "https://api.linear.app/oauth/token",
  // read,write for issues; admin required to register team webhooks via API
  scopes: ["read,write,admin"],
  clientId: process.env.LINEAR_CLIENT_ID,
  clientSecret: process.env.LINEAR_CLIENT_SECRET,
  tokenAuthStyle: "header",
  fetchAccountInfo: async (accessToken) => {
    const data = await linearGraphql<{
      viewer: { email: string; id: string; name: string };
    }>(accessToken, "query { viewer { id name email } }");
    return {
      providerAccountId: data.viewer.id,
      providerAccountLabel: data.viewer.name || data.viewer.email,
    };
  },
  sync: linearSync,
};
