"use node";

import {
  extractLinksFromMarkdown,
  renderMarkdown,
} from "@omi/ai/browser-render";
import { extractEmbedContent } from "@omi/ai/embed-extraction";
import { extractArticleContent } from "@omi/ai/extraction";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";

const EMBED_PATTERNS: Array<{
  type:
    | "youtube"
    | "tweet"
    | "reddit"
    | "spotify"
    | "github_gist"
    | "codepen"
    | "vimeo"
    | "loom"
    | "figma"
    | "codesandbox"
    | "bluesky"
    | "soundcloud"
    | "google_docs"
    | "google_sheets"
    | "google_slides"
    | "notion";
  pattern: RegExp;
  extractId: (match: RegExpMatchArray) => string;
}> = [
  {
    type: "youtube",
    pattern:
      /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    extractId: (m) => m[1] as string,
  },
  {
    type: "tweet",
    pattern: /(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/,
    extractId: (m) => m[1] as string,
  },
  {
    type: "reddit",
    pattern: /reddit\.com\/r\/\w+\/comments\/(\w+)/,
    extractId: (m) => m[1] as string,
  },
  {
    type: "spotify",
    pattern: /open\.spotify\.com\/(track|album|playlist)\/(\w+)/,
    extractId: (m) => `${m[1]}/${m[2]}`,
  },
  {
    type: "github_gist",
    pattern: /gist\.github\.com\/\w+\/([a-f0-9]+)/,
    extractId: (m) => m[1] as string,
  },
  {
    type: "codepen",
    pattern: /codepen\.io\/(\w+)\/pen\/(\w+)/,
    extractId: (m) => `${m[1]}/${m[2]}`,
  },
  {
    type: "vimeo",
    pattern:
      /(?:vimeo\.com\/(?:video\/|channels\/[^/]+\/|groups\/[^/]+\/videos\/)?|player\.vimeo\.com\/video\/)(\d+)/,
    extractId: (m) => m[1] as string,
  },
  {
    type: "loom",
    pattern: /loom\.com\/(?:share|embed)\/([a-f0-9]{24,})/,
    extractId: (m) => m[1] as string,
  },
  {
    type: "figma",
    pattern: /figma\.com\/(?:file|design|proto|board)\/([a-zA-Z0-9]+)/,
    extractId: (m) => m[1] as string,
  },
  {
    type: "codesandbox",
    pattern: /codesandbox\.io\/(?:s|embed|p\/sandbox)\/([a-zA-Z0-9-]+)/,
    extractId: (m) => m[1] as string,
  },
  {
    type: "bluesky",
    pattern: /bsky\.app\/profile\/([^/]+)\/post\/([a-zA-Z0-9]+)/,
    extractId: (m) => `${m[1]}/${m[2]}`,
  },
  {
    type: "soundcloud",
    pattern: /soundcloud\.com\/([^/]+)\/(?:sets\/)?([^/?#]+)/,
    extractId: (m) => `${m[1]}/${m[2]}`,
  },
  {
    type: "google_docs",
    pattern: /docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/,
    extractId: (m) => m[1] as string,
  },
  {
    type: "google_sheets",
    pattern: /docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/,
    extractId: (m) => m[1] as string,
  },
  {
    type: "google_slides",
    pattern: /docs\.google\.com\/presentation\/d\/([a-zA-Z0-9_-]+)/,
    extractId: (m) => m[1] as string,
  },
  {
    type: "notion",
    pattern:
      /(?:(?:[\w-]+\.)?notion\.(?:so|site))\/(?:[^/]+\/)?(?:[^/?#]*-)?([a-f0-9]{32}|[a-zA-Z0-9-]{22,})/,
    extractId: (m) => m[1] as string,
  },
];

function detectEmbed(url: string) {
  for (const { type, pattern, extractId } of EMBED_PATTERNS) {
    const match = url.match(pattern);
    if (match) {
      return { type, id: extractId(match) };
    }
  }
  return null;
}

function extractMetaContent(
  html: string,
  property: string
): string | undefined {
  const regex = new RegExp(
    `<meta[^>]*(?:property|name)=["']${property}["'][^>]*content=["']([^"']*)["']|<meta[^>]*content=["']([^"']*)["'][^>]*(?:property|name)=["']${property}["']`,
    "i"
  );
  const match = html.match(regex);
  return match?.[1] ?? match?.[2] ?? undefined;
}

const LINK_TAG_REGEX = /<link\b[^>]*>/gi;
const REL_ATTR_REGEX = /\brel\s*=\s*["']([^"']+)["']/i;
const HREF_ATTR_REGEX = /\bhref\s*=\s*["']([^"']+)["']/i;
const WHITESPACE_REGEX = /\s+/;
const ICON_REL_PRIORITY = [
  "icon",
  "shortcut icon",
  "apple-touch-icon",
  "apple-touch-icon-precomposed",
  "mask-icon",
  "fluid-icon",
];

function extractFaviconCandidates(html: string, baseUrl: string): string[] {
  const found: { rel: string; href: string }[] = [];
  const matches = html.matchAll(LINK_TAG_REGEX);
  for (const m of matches) {
    const tag = m[0];
    const relMatch = tag.match(REL_ATTR_REGEX);
    const hrefMatch = tag.match(HREF_ATTR_REGEX);
    if (!(relMatch?.[1] && hrefMatch?.[1])) {
      continue;
    }
    const rels = relMatch[1].toLowerCase().split(WHITESPACE_REGEX);
    const matchedRel = ICON_REL_PRIORITY.find((r) =>
      rels.includes(r.toLowerCase())
    );
    if (!matchedRel) {
      continue;
    }
    found.push({ rel: matchedRel, href: hrefMatch[1] });
  }

  found.sort(
    (a, b) =>
      ICON_REL_PRIORITY.indexOf(a.rel) - ICON_REL_PRIORITY.indexOf(b.rel)
  );

  const urls: string[] = [];
  for (const { href } of found) {
    try {
      urls.push(new URL(href, baseUrl).href);
    } catch {
      // skip invalid hrefs
    }
  }
  return urls;
}

function googleS2Favicon(baseUrl: string): string | undefined {
  try {
    const domain = new URL(baseUrl).hostname;
    if (domain) {
      return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
    }
  } catch {
    // invalid baseUrl
  }
  return undefined;
}

async function isValidIconUrl(url: string): Promise<boolean> {
  try {
    // Try GET with a tiny range; some servers reject HEAD or block bot UAs.
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(3000),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        Accept: "image/*,*/*;q=0.8",
        Range: "bytes=0-0",
      },
    });
    if (!res.ok && res.status !== 206) {
      return false;
    }
    const contentType = (res.headers.get("content-type") ?? "").toLowerCase();
    if (
      contentType.includes("text/html") ||
      contentType.includes("application/json")
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

async function resolveValidFavicon(
  html: string,
  baseUrl: string
): Promise<string | undefined> {
  const candidates: string[] = [...extractFaviconCandidates(html, baseUrl)];

  try {
    candidates.push(new URL("/favicon.ico", baseUrl).href);
  } catch {
    // invalid baseUrl, skip
  }

  for (const url of candidates) {
    if (await isValidIconUrl(url)) {
      return url;
    }
  }

  // Final fallback: Google's S2 favicon service. Always returns something
  // (a generic globe for unknown domains), so don't validate it — just
  // hand back the URL and let the browser load it.
  return googleS2Favicon(baseUrl);
}

// Kept lean on the hot websiteResource row (loaded by list previews); the
// enricher only reads the first ~12k chars anyway.
const MAX_ARTICLE_EXCERPT = 16_000;
// Full markdown lives in the detail-only resourceContent table; cap well under
// Convex's 1MB per-document limit.
const MAX_STORED_MARKDOWN = 500_000;
const FETCH_TIMEOUT_MS = 10_000;

type ContentSource = "cloudflare" | "readability" | "embed";

// Best-effort cheap fetch for OG tags + favicon. Non-fatal: a bot-block here
// must not abort content extraction, since Cloudflare may still render the page.
async function fetchOgAndFavicon(url: string): Promise<{
  html?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  siteName?: string;
  favicon?: string;
}> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: controller.signal,
      redirect: "follow",
    });
    clearTimeout(timeout);
    if (!response.ok) {
      return {};
    }
    const html = await response.text();
    return {
      html,
      ogTitle: extractMetaContent(html, "og:title"),
      ogDescription: extractMetaContent(html, "og:description"),
      ogImage: extractMetaContent(html, "og:image"),
      siteName: extractMetaContent(html, "og:site_name"),
      favicon: await resolveValidFavicon(html, url),
    };
  } catch {
    return {};
  }
}

export const extractWebsiteMetadata = internalAction({
  args: {
    resourceId: v.id("resource"),
    skipAI: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await ctx.runMutation(
      internal.resource.internals.setWebsiteMetadataStatus,
      {
        resourceId: args.resourceId,
        metadataStatus: "processing",
      }
    );

    const websiteResource = await ctx.runQuery(
      internal.resource.internals.getWebsiteResource,
      { resourceId: args.resourceId }
    );

    if (!websiteResource) {
      await ctx.runMutation(
        internal.resource.internals.setWebsiteMetadataStatus,
        {
          resourceId: args.resourceId,
          metadataStatus: "failed",
          metadataError: "Website resource not found",
        }
      );
      return;
    }

    const url = websiteResource.url;
    const og = await fetchOgAndFavicon(url);
    let { ogTitle, ogImage } = og;

    const embed = detectEmbed(url);
    let articleContent: string | undefined;
    let extractedLinks: string[] | undefined;
    let fullMarkdown: string | undefined;
    let contentSource: ContentSource | undefined;

    if (embed) {
      // Embed sites return useless HTML to scrapers — use their native APIs,
      // and never spend a paid render on them.
      const embedContent = await extractEmbedContent(
        embed.type,
        embed.id,
        og.html ?? "",
        url
      );
      articleContent = embedContent?.textContent;
      if (embedContent) {
        ogTitle ??= embedContent.title;
        ogImage ??= embedContent.thumbnailUrl;
      }
      contentSource = "embed";
    } else {
      // Imports/rehydration pass skipAI — keep them Readability-only (no render).
      const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
      const apiToken = process.env.CLOUDFLARE_BROWSER_RENDERING_API_TOKEN;

      if (!args.skipAI && accountId && apiToken) {
        const reservation = await ctx.runMutation(
          internal.billing.credits.reserveBrowserRender,
          { resourceId: args.resourceId }
        );

        if (reservation.allowed) {
          let markdown: string | null = null;
          try {
            markdown = await renderMarkdown({ url, accountId, apiToken });
          } catch {
            markdown = null;
          }

          if (markdown) {
            fullMarkdown = markdown.slice(0, MAX_STORED_MARKDOWN);
            articleContent = markdown.slice(0, MAX_ARTICLE_EXCERPT);
            extractedLinks = extractLinksFromMarkdown(markdown, url);
            contentSource = "cloudflare";
          } else {
            // Cloudflare doesn't bill failed renders — give the slot back.
            await ctx.runMutation(
              internal.billing.credits.refundBrowserRender,
              { billingAccountId: reservation.billingAccountId }
            );
          }
        }
      }

      // Fallback (no creds / over cap / render failed): local Readability.
      if (!articleContent && og.html) {
        const article = extractArticleContent(og.html, url);
        articleContent = article?.textContent;
      }
      contentSource ??= "readability";
    }

    // "completed" as long as we reached the page at all; only a total failure
    // (unreachable + no render + not an embed) is "failed", matching prior UX.
    const reachedPage = Boolean(og.html) || Boolean(articleContent) || !!embed;

    await ctx.runMutation(internal.resource.internals.updateWebsiteMetadata, {
      resourceId: args.resourceId,
      ogTitle,
      ogDescription: og.ogDescription,
      ogImage,
      siteName: og.siteName,
      favicon: og.favicon ?? googleS2Favicon(url),
      isEmbeddable: embed !== null,
      embedType: embed?.type,
      embedId: embed?.id,
      articleContent,
      extractedLinks,
      contentSource,
      metadataStatus: reachedPage ? "completed" : "failed",
      metadataError: reachedPage ? undefined : "Could not fetch or render page",
    });

    if (fullMarkdown) {
      await ctx.runMutation(
        internal.resource.internals.upsertResourceMarkdown,
        { resourceId: args.resourceId, markdownContent: fullMarkdown }
      );
    }

    if (!args.skipAI) {
      await ctx.scheduler.runAfter(
        0,
        internal.resource.aiActions.processResourceAI,
        { resourceId: args.resourceId }
      );
    }
  },
});
