import { describe, expect, it } from "vitest";
import { extractBoostTerms, matchesBoostTerms } from "./memoryBoost";

describe("extractBoostTerms", () => {
  it("returns no terms for empty or nullish memory", () => {
    expect(extractBoostTerms(null)).toEqual([]);
    expect(extractBoostTerms(undefined)).toEqual([]);
    expect(extractBoostTerms("")).toEqual([]);
  });

  it("only pulls terms from the boost section headings", () => {
    const memory = [
      "## Active Projects",
      "- Building a rust compiler",
      "## Background",
      "- Studied python at university",
    ].join("\n");
    const terms = extractBoostTerms(memory);
    expect(terms).toContain("rust");
    expect(terms).toContain("compiler");
    expect(terms).not.toContain("python");
    expect(terms).not.toContain("university");
  });

  it("reads from both boost headings", () => {
    const memory = [
      "## Active Projects",
      "- distributed systems",
      "## Recurring Interests",
      "- typography",
    ].join("\n");
    const terms = extractBoostTerms(memory);
    expect(terms).toEqual(
      expect.arrayContaining(["distributed", "systems", "typography"])
    );
  });

  it("strips bullet prefixes and keeps only the text before a delimiter", () => {
    const memory = ["## Active Projects", "- omi — a search engine"].join("\n");
    const terms = extractBoostTerms(memory);
    expect(terms).toContain("omi");
    expect(terms).not.toContain("search");
    expect(terms).not.toContain("engine");
  });

  it("drops stopwords and terms shorter than 3 chars", () => {
    const memory = ["## Active Projects", "- the ai and ml work"].join("\n");
    const terms = extractBoostTerms(memory);
    expect(terms).not.toContain("the");
    expect(terms).not.toContain("and");
    expect(terms).not.toContain("ai");
    expect(terms).not.toContain("ml");
    expect(terms).toContain("work");
  });

  it("lowercases and deduplicates terms", () => {
    const memory = ["## Active Projects", "- Rust rust RUST"].join("\n");
    expect(extractBoostTerms(memory)).toEqual(["rust"]);
  });

  it("caps the number of returned terms at 30", () => {
    const words = Array.from({ length: 50 }, (_, i) => `term${i}`).join(" ");
    const memory = `## Active Projects\n- ${words}`;
    expect(extractBoostTerms(memory)).toHaveLength(30);
  });
});

describe("matchesBoostTerms", () => {
  it("returns false when there are no boost terms", () => {
    expect(matchesBoostTerms("rust", [])).toBe(false);
  });

  it("matches as a case-insensitive substring", () => {
    expect(matchesBoostTerms("Rust Compiler", ["rust"])).toBe(true);
    expect(matchesBoostTerms("compiler", ["rust"])).toBe(false);
  });
});
