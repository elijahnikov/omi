export interface BentoFeature {
  description: string;
  title: string;
}

export const bentoFeatures: BentoFeature[] = [
  {
    title: "Comments & @mentions",
    description:
      "Discuss any resource with your team. Mention teammates, track unread threads, keep context where the knowledge lives.",
  },
  {
    title: "Daily notes",
    description:
      "A fresh page every day for journaling, capture, and thinking out loud — automatically dated and searchable.",
  },
  {
    title: "AI enrichment on save",
    description:
      "Every save is summarized, tagged, and embedded automatically — concepts and entities extracted in the background, no effort from you.",
  },
  {
    title: "Real-time collaboration",
    description:
      "Write together in a full block editor. See live cursors, @mention teammates, and check things off as the doc updates in real time.",
  },
  {
    title: "Collections & nested folders",
    description:
      "Organize loosely or tightly. Nest collections as deep as you like, pin what matters, archive what doesn't.",
  },
  {
    title: "Bulk import and live sync",
    description:
      "Bring everything with you. Import from Notion, Evernote, Markdown, and CSV — or live-sync GitHub, Linear, and more — enriched and linked on arrival.",
  },
];

export const captureSurfaces = [
  "Browser extension",
  "Raycast",
  "iOS",
  "macOS",
  "Web",
  "API",
];
