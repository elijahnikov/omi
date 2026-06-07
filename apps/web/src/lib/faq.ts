export interface FaqItem {
  answer: string;
  question: string;
}

export const faqItems: FaqItem[] = [
  {
    question: "Is my data private?",
    answer:
      "Yes. Your library is yours. Workspaces are private by default, AI provider keys are encrypted at rest, and you choose exactly what — if anything — you make public via read-only share links.",
  },
  {
    question: "Which AI models are supported?",
    answer:
      "Claude (Anthropic), OpenAI, and Google. You can bring your own API keys so AI calls run on your own provider account, giving you full control over models and cost.",
  },
  {
    question: "How is semantic search different from keyword search?",
    answer:
      "Omi ranks results by meaning, not just matching words. It combines title matches, vector similarity, content chunks, AI-extracted concepts, and your own usage patterns so you find the right thing even when you can't remember the exact words.",
  },
  {
    question: "What can I connect to Omi?",
    answer:
      "Notion, Raindrop, Google Drive, Readwise, GitHub, and Linear sync automatically via OAuth. You can also connect external MCP servers so your AI chat can take actions — create issues, check your calendar, send email — grounded in your knowledge.",
  },
  {
    question: "Can I import my existing notes?",
    answer:
      "Yes. Bulk-import from Notion, Evernote, Markdown, and CSV. Your content is enriched, embedded, and automatically linked to related material as it arrives.",
  },
  {
    question: "Does it work on mobile and in my browser?",
    answer:
      "Omi runs on the web, desktop (macOS), a browser extension, Raycast, and mobile — all syncing to one library in real time. Capture anywhere, find it everywhere.",
  },
];
