export interface BentoFeature {
  description: string;
  title: string;
}

/** Secondary features for the bento grid (the killers get their own sections). */
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
    title: "Public share links",
    description:
      "Publish any resource as a clean, read-only page with a single click. Share knowledge without giving up your workspace.",
  },
  {
    title: "Rich notes & web embeds",
    description:
      "Write with a full block editor. Save articles with the original embedded — YouTube, X, Figma, Google Docs, and more.",
  },
  {
    title: "Collections & nested folders",
    description:
      "Organize loosely or tightly. Nest collections as deep as you like, pin what matters, archive what doesn't.",
  },
  {
    title: "Bulk import",
    description:
      "Bring everything with you. Import from Notion, Evernote, Markdown, and CSV — enriched and linked on arrival.",
  },
];

/** Surfaces Omi captures from — honest 'social proof' for the strip. */
export const captureSurfaces = [
  "Browser extension",
  "Raycast",
  "iOS",
  "macOS",
  "Web",
  "API",
];
