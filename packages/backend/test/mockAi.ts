const EMBEDDING_DIM = 1536;
const EMBEDDING_MODEL = "text-embedding-3-small";
function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = Math.imul(31, hash) + input.charCodeAt(i);
  }
  return hash;
}
export function fakeEmbedding(text: string): number[] {
  const seed = hashString(text);
  const vec = new Array<number>(EMBEDDING_DIM);
  let squareSum = 0;
  for (let i = 0; i < EMBEDDING_DIM; i++) {
    const x = Math.sin(seed * 9301 + i * 49_297) * 43_758.545;
    const v = x - Math.floor(x) - 0.5;
    vec[i] = v;
    squareSum += v * v;
  }
  const norm = Math.sqrt(squareSum) || 1;
  for (let i = 0; i < EMBEDDING_DIM; i++) {
    vec[i] = (vec[i] as number) / norm;
  }
  return vec;
}
export function mockProvidersModule() {
  return {
    createOpenAIProvider: (_apiKey: string) => ({}),
  };
}
export function mockEmbeddingsModule() {
  return {
    generateEmbedding: async (_provider: unknown, text: string) => ({
      embedding: fakeEmbedding(text),
      model: EMBEDDING_MODEL,
      tokens: Math.max(1, Math.ceil(text.length / 4)),
    }),
    generateEmbeddings: async (_provider: unknown, texts: string[]) => ({
      embeddings: texts.map((t) => fakeEmbedding(t)),
      model: EMBEDDING_MODEL,
      tokens: texts.reduce(
        (n, t) => n + Math.max(1, Math.ceil(t.length / 4)),
        0
      ),
    }),
  };
}
export interface MockEnrichmentResult {
  category: string;
  concepts?: Array<{
    name: string;
    importance: number;
  }>;
  extractedEntities: string[];
  keyQuotes: string[];
  language: string;
  sentiment: string;
  summary: string;
  tags: string[];
}
export function defaultEnrichmentResult(
  overrides: Partial<MockEnrichmentResult> = {}
): MockEnrichmentResult {
  return {
    summary: "A mock summary.",
    tags: ["mock-tag"],
    extractedEntities: [],
    sentiment: "neutral",
    language: "en",
    category: "general",
    keyQuotes: [],
    concepts: [],
    ...overrides,
  };
}
export function mockEnrichmentModule(result: MockEnrichmentResult) {
  return {
    createEnricher: (_provider: unknown, _input: unknown) => ({
      enrich: async () => ({ result, tokens: 500, model: "gpt-4o-mini" }),
    }),
  };
}
export function mockMemoryModule(content: string) {
  return {
    extractMemory: async (_provider: unknown, _input: unknown) => ({ content }),
    wordJaccardSimilarity: (a: string, b: string): number => {
      const tokens = (s: string) =>
        new Set(s.toLowerCase().match(/\w+/g) ?? []);
      const setA = tokens(a);
      const setB = tokens(b);
      if (setA.size === 0 && setB.size === 0) {
        return 1;
      }
      let intersection = 0;
      for (const t of setA) {
        if (setB.has(t)) {
          intersection += 1;
        }
      }
      const union = setA.size + setB.size - intersection;
      return union === 0 ? 0 : intersection / union;
    },
    MAX_MEMORY_WORDS: 225,
  };
}
