import {
  GIT_DIFF_FILE_BREAK_REGEX,
  UNIFIED_DIFF_FILE_BREAK_REGEX,
} from "@pierre/diffs";

const GIT_FILE_NAME =
  /^diff --git (?:"a\/(.+?)"|a\/(.+?)) (?:"b\/(.+?)"|b\/(.+?))$/m;
const PLUS_FILE_NAME = /^\+\+\+ [ab]\/([^\t\r\n]+)/m;
const PLUS_FILE_NAME_PLAIN = /^\+\+\+ ([^\t\r\n]+)/m;

const GIT_PATCH_PREFIX = /^diff --git/m;

export interface PrPatchFileChunk {
  additions: number;
  chunk: string;
  deletions: number;
  fileName: string;
  id: string;
  isGitDiff: boolean;
}

function isGitPatch(patch: string): boolean {
  return GIT_PATCH_PREFIX.test(patch);
}

function isFileChunk(chunk: string, isGitDiff: boolean): boolean {
  return isGitDiff
    ? GIT_DIFF_FILE_BREAK_REGEX.test(chunk)
    : UNIFIED_DIFF_FILE_BREAK_REGEX.test(chunk);
}

function extractFileName(chunk: string): string {
  const gitMatch = chunk.match(GIT_FILE_NAME);
  if (gitMatch) {
    return (
      gitMatch[3] ??
      gitMatch[4] ??
      gitMatch[1] ??
      gitMatch[2] ??
      "file"
    ).trim();
  }

  const plusMatch =
    chunk.match(PLUS_FILE_NAME) ?? chunk.match(PLUS_FILE_NAME_PLAIN);
  return plusMatch?.[1]?.trim() ?? "file";
}

function countLineStats(chunk: string): {
  additions: number;
  deletions: number;
} {
  let additions = 0;
  let deletions = 0;

  for (const line of chunk.split("\n")) {
    if (line.startsWith("+") && !line.startsWith("+++")) {
      additions += 1;
    } else if (line.startsWith("-") && !line.startsWith("---")) {
      deletions += 1;
    }
  }

  return { additions, deletions };
}

export function splitPatchIntoFileChunks(patch: string): PrPatchFileChunk[] {
  const isGitDiff = isGitPatch(patch);
  const breakRegex = isGitDiff
    ? GIT_DIFF_FILE_BREAK_REGEX
    : UNIFIED_DIFF_FILE_BREAK_REGEX;
  const rawFiles = patch.split(breakRegex);

  return rawFiles
    .filter((chunk) => isFileChunk(chunk, isGitDiff))
    .map((chunk, index) => {
      const fileName = extractFileName(chunk);
      return {
        id: `${index}-${fileName}`,
        chunk,
        fileName,
        ...countLineStats(chunk),
        isGitDiff,
      };
    });
}
