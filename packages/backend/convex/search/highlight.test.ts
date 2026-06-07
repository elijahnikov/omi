import { describe, expect, it } from "vitest";
import {
  buildSnippet,
  escapeHtml,
  extractQueryTokens,
  highlight,
} from "./highlight";

describe("escapeHtml", () => {
  it("escapes all five HTML-sensitive characters", () => {
    expect(escapeHtml(`<a href="x">'&'</a>`)).toBe(
      "&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;"
    );
  });
  it("leaves plain text untouched", () => {
    expect(escapeHtml("hello world")).toBe("hello world");
  });
});
describe("extractQueryTokens", () => {
  it("splits on whitespace and drops tokens shorter than 2 chars", () => {
    expect(extractQueryTokens("a rust wasm")).toEqual(["rust", "wasm"]);
  });
  it("deduplicates repeated tokens", () => {
    expect(extractQueryTokens("rust rust wasm")).toEqual(["rust", "wasm"]);
  });
  it("returns an empty array for blank input", () => {
    expect(extractQueryTokens("   ")).toEqual([]);
  });
});
describe("highlight", () => {
  it("wraps matched tokens in <mark> case-insensitively", () => {
    expect(highlight("Rust is great", ["rust"])).toBe(
      "<mark>Rust</mark> is great"
    );
  });
  it("escapes HTML before marking so injected markup is inert", () => {
    const result = highlight("<script>rust</script>", ["rust"]);
    expect(result).toBe("&lt;script&gt;<mark>rust</mark>&lt;/script&gt;");
    expect(result).not.toContain("<script>");
  });
  it("prefers the longest token when matches overlap", () => {
    expect(highlight("rust lang rocks", ["rust", "rust lang"])).toBe(
      "<mark>rust lang</mark> rocks"
    );
  });
  it("returns escaped text unchanged when there are no tokens", () => {
    expect(highlight("a < b", [])).toBe("a &lt; b");
  });
});
describe("buildSnippet", () => {
  it("returns null for empty or whitespace-only sources", () => {
    expect(buildSnippet(null, ["rust"])).toBeNull();
    expect(buildSnippet(undefined, ["rust"])).toBeNull();
    expect(buildSnippet("   ", ["rust"])).toBeNull();
  });
  it("collapses internal whitespace", () => {
    expect(buildSnippet("hello    world", [])).toBe("hello world");
  });
  it("centers the window on the first matching token with ellipses", () => {
    const long = `${"a ".repeat(200)}needle${" b".repeat(200)}`;
    const snippet = buildSnippet(long, ["needle"]);
    expect(snippet).not.toBeNull();
    expect(snippet).toContain("<mark>needle</mark>");
    expect(snippet?.startsWith("…")).toBe(true);
    expect(snippet?.endsWith("…")).toBe(true);
  });
  it("has no leading ellipsis when the match is near the start", () => {
    const snippet = buildSnippet(`needle ${"x ".repeat(200)}`, ["needle"]);
    expect(snippet?.startsWith("…")).toBe(false);
    expect(snippet).toContain("<mark>needle</mark>");
  });
  it("falls back to the head of the text when no token matches", () => {
    const snippet = buildSnippet("the quick brown fox", ["zebra"]);
    expect(snippet).toBe("the quick brown fox");
  });
});
