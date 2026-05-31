const MARKDOWN_ENDPOINT = (accountId: string) =>
  `https://api.cloudflare.com/client/v4/accounts/${accountId}/browser-rendering/markdown`;

const DEFAULT_TIMEOUT_MS = 30_000;
const MAX_LINKS = 100;

export interface RenderMarkdownArgs {
  accountId: string;
  apiToken: string;
  timeoutMs?: number;
  url: string;
}

interface MarkdownResponse {
  result?: string;
  success?: boolean;
}

export async function renderMarkdown({
  url,
  accountId,
  apiToken,
  timeoutMs = DEFAULT_TIMEOUT_MS,
}: RenderMarkdownArgs): Promise<string | null> {
  const response = await fetch(MARKDOWN_ENDPOINT(accountId), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiToken}`,
    },
    body: JSON.stringify({ url }),
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as MarkdownResponse;
  if (!(data.success && data.result)) {
    return null;
  }

  return data.result;
}

const MARKDOWN_LINK_REGEX = /\[[^\]]*\]\((https?:\/\/[^\s)]+)\)/g;
const BARE_URL_REGEX = /(?<![([])\bhttps?:\/\/[^\s)<>"']+/g;
const TRAILING_PUNCTUATION_REGEX = /[.,;:!?]+$/;

export function extractLinksFromMarkdown(
  markdown: string,
  baseUrl: string
): string[] {
  const seen = new Set<string>();
  const links: string[] = [];

  const push = (raw: string) => {
    if (links.length >= MAX_LINKS) {
      return;
    }
    const cleaned = raw.replace(TRAILING_PUNCTUATION_REGEX, "");
    let resolved: string;
    try {
      resolved = new URL(cleaned, baseUrl).href;
    } catch {
      return;
    }
    if (!resolved.startsWith("http")) {
      return;
    }
    if (seen.has(resolved)) {
      return;
    }
    seen.add(resolved);
    links.push(resolved);
  };

  for (const match of markdown.matchAll(MARKDOWN_LINK_REGEX)) {
    if (match[1]) {
      push(match[1]);
    }
  }

  for (const match of markdown.matchAll(BARE_URL_REGEX)) {
    push(match[0]);
  }

  return links;
}
