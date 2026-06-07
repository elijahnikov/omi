export interface RerankDocument {
  id: string;
  text: string;
}

export interface RerankResult {
  id: string;
  index: number;
  relevanceScore: number;
}

const COHERE_RERANK_URL = "https://api.cohere.com/v2/rerank";
const DEFAULT_MODEL = "rerank-v3.5";

export async function rerankDocuments(
  apiKey: string,
  query: string,
  documents: RerankDocument[],
  topN: number
): Promise<RerankResult[]> {
  if (documents.length === 0) {
    return [];
  }

  const response = await fetch(COHERE_RERANK_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      query,
      documents: documents.map((doc) => doc.text),
      top_n: Math.min(topN, documents.length),
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Cohere rerank failed (${response.status}): ${body}`);
  }

  const payload = (await response.json()) as {
    results: Array<{ index: number; relevance_score: number }>;
  };

  return payload.results.map((result) => ({
    id: documents[result.index]?.id ?? String(result.index),
    index: result.index,
    relevanceScore: result.relevance_score,
  }));
}

export function buildRerankText(input: {
  title: string;
  summary?: string | null;
  snippet?: string | null;
}): string {
  const parts = [input.title];
  if (input.summary) {
    parts.push(input.summary);
  }
  if (input.snippet) {
    parts.push(input.snippet);
  }
  return parts.join("\n\n").slice(0, 4000);
}
