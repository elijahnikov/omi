export const site = {
  name: "Omi",
  url: "https://omi.ac",
  tagline: "The knowledge base that thinks with you",
  description:
    "Omi is the AI-native knowledge base. Capture anything, find it by meaning, and let your AI act on it with semantic search, smart connections, and MCP-powered chat.",
  twitter: "@omi",
} as const;

const appUrl = "https://app.omi.ac";

export const links = {
  register: `${appUrl}/register`,
  login: `${appUrl}/login`,
  demo: `${appUrl}/register`,
  docs: "https://docs.omi.ac",
  github: "https://github.com/omi",
  twitter: "https://x.com/omi",
} as const;
