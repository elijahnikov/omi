import { links } from "~/lib/site";

export interface PricingTier {
  cadence?: string;
  cta: { label: string; href: string };
  featured?: boolean;
  /** Mirrors apps/app billing-tab + packages/backend/convex/billing/pricing.ts */
  features: string[];
  name: string;
  price: string;
  tagline: string;
}

export const pricingTiers: PricingTier[] = [
  {
    name: "Free",
    price: "$0",
    cadence: "forever",
    tagline: "Try the product without a card.",
    cta: { label: "Get started", href: links.register },
    features: [
      "500 AI actions / month",
      "100 MB file storage",
      "Up to 3 workspaces",
      "100 web captures / month",
      "Auto-summaries, tagging, semantic search, and chat — within your credit budget",
      "All imports and connections (Notion, Raindrop, Readwise, Fabric, MyMind, Evernote, bookmarks)",
      "Bring your own API key (skips credit charges for chat and search)",
    ],
  },
  {
    name: "Basic",
    price: "$5",
    cadence: "/ month",
    tagline: "For active personal libraries.",
    cta: { label: "Start Basic", href: links.register },
    featured: true,
    features: [
      "Everything in Free",
      "3,000 AI actions / month",
      "5 GB file storage",
      "Unlimited workspaces",
      "2,000 web captures / month",
      "Home-page AI insights: concept clusters, recent connections, forgotten gems",
    ],
  },
  {
    name: "Pro",
    price: "$12",
    cadence: "/ month",
    tagline: "For heavy users.",
    cta: { label: "Start Pro", href: links.register },
    features: [
      "Everything in Basic",
      "10,000 AI actions / month",
      "25 GB file storage",
      "Unlimited workspaces",
      "Unlimited web captures",
      "Continuous sync (GitHub, Linear, and more)",
    ],
  },
];
