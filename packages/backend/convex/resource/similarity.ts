export interface WeightedConcept {
  importance: number;
  name: string;
}

export function computeWeightedJaccard(
  conceptsA: WeightedConcept[],
  conceptsB: WeightedConcept[]
): { overlap: number; sharedNames: string[] } {
  const mapA = new Map(
    conceptsA.map((c) => [c.name.toLowerCase(), c.importance])
  );
  const mapB = new Map(
    conceptsB.map((c) => [c.name.toLowerCase(), c.importance])
  );

  const allKeys = new Set([...mapA.keys(), ...mapB.keys()]);
  let intersectionSum = 0;
  let unionSum = 0;
  const sharedNames: string[] = [];

  for (const key of allKeys) {
    const a = mapA.get(key) ?? 0;
    const b = mapB.get(key) ?? 0;
    intersectionSum += Math.min(a, b);
    unionSum += Math.max(a, b);
    if (a > 0 && b > 0) {
      sharedNames.push(key);
    }
  }

  const overlap = unionSum > 0 ? intersectionSum / unionSum : 0;
  return { overlap, sharedNames };
}
