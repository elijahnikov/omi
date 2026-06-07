import { describe, expect, it } from "vitest";
import { computeWeightedJaccard } from "./similarity";

describe("computeWeightedJaccard", () => {
  it("returns 0 overlap and no shared names for two empty sets", () => {
    expect(computeWeightedJaccard([], [])).toEqual({
      overlap: 0,
      sharedNames: [],
    });
  });
  it("returns 0 overlap when one side is empty", () => {
    const result = computeWeightedJaccard(
      [{ name: "rust", importance: 1 }],
      []
    );
    expect(result.overlap).toBe(0);
    expect(result.sharedNames).toEqual([]);
  });
  it("returns 1 for identical equally-weighted sets", () => {
    const concepts = [
      { name: "rust", importance: 1 },
      { name: "wasm", importance: 1 },
    ];
    const result = computeWeightedJaccard(concepts, concepts);
    expect(result.overlap).toBe(1);
    expect(result.sharedNames.sort()).toEqual(["rust", "wasm"]);
  });
  it("returns 0 overlap for disjoint sets", () => {
    const result = computeWeightedJaccard(
      [{ name: "rust", importance: 2 }],
      [{ name: "python", importance: 2 }]
    );
    expect(result.overlap).toBe(0);
    expect(result.sharedNames).toEqual([]);
  });
  it("weights overlap by importance: sum(min) / sum(max)", () => {
    const result = computeWeightedJaccard(
      [
        { name: "rust", importance: 3 },
        { name: "wasm", importance: 2 },
      ],
      [
        { name: "rust", importance: 1 },
        { name: "python", importance: 4 },
      ]
    );
    expect(result.overlap).toBeCloseTo(1 / 9);
    expect(result.sharedNames).toEqual(["rust"]);
  });
  it("matches concept names case-insensitively", () => {
    const result = computeWeightedJaccard(
      [{ name: "Rust", importance: 1 }],
      [{ name: "RUST", importance: 1 }]
    );
    expect(result.overlap).toBe(1);
    expect(result.sharedNames).toEqual(["rust"]);
  });
  it("does not count a name shared when one side has zero importance", () => {
    const result = computeWeightedJaccard(
      [{ name: "rust", importance: 0 }],
      [{ name: "rust", importance: 5 }]
    );
    expect(result.overlap).toBe(0);
    expect(result.sharedNames).toEqual([]);
  });
});
