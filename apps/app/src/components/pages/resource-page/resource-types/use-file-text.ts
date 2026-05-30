import { useQuery } from "@tanstack/react-query";

export const MAX_TEXT_PREVIEW_BYTES = 1024 * 1024; // 1MB

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "too-large" }
  | { status: "ready"; text: string };

type FileTextResult = { kind: "ready"; text: string } | { kind: "too-large" };

async function fetchFileText(url: string): Promise<FileTextResult> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const contentLength = response.headers.get("content-length");
  if (contentLength && Number(contentLength) > MAX_TEXT_PREVIEW_BYTES) {
    return { kind: "too-large" };
  }

  const text = await response.text();
  if (text.length > MAX_TEXT_PREVIEW_BYTES) {
    return { kind: "too-large" };
  }

  return { kind: "ready", text };
}

export function useFileText(url: string | null): State {
  const query = useQuery({
    queryKey: ["file-text", url],
    queryFn: () => fetchFileText(url as string),
    enabled: !!url,
  });

  if (!url) {
    return { status: "error", message: "No file URL" };
  }
  if (query.isError) {
    return {
      status: "error",
      message:
        query.error instanceof Error ? query.error.message : "Failed to load",
    };
  }
  if (query.data) {
    return query.data.kind === "too-large"
      ? { status: "too-large" }
      : { status: "ready", text: query.data.text };
  }
  return { status: "loading" };
}
