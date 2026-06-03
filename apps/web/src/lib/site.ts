import { env } from "~/env";

export const site = {
  name: "Omi",
  url: "https://omi.co",
  tagline: "The knowledge base that thinks with you",
  description:
    "Omi is the AI-native knowledge base. Capture anything, find it by meaning, and let your AI act on it with semantic search, smart connections, and MCP-powered chat.",
  twitter: "@omi",
} as const;

// Fallback keeps links valid even when env validation is skipped (the zod
// default only applies when validation runs).
const appUrl = env.NEXT_PUBLIC_APP_URL ?? "https://app.omi.co";

export const links = {
  register: `${appUrl}/register`,
  login: `${appUrl}/login`,
  demo: `${appUrl}/register`,
  docs: "https://docs.omi.co",
  github: "https://github.com/omi",
  twitter: "https://x.com/omi",
} as const;
