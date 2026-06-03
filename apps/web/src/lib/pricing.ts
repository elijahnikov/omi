import { links } from "~/lib/site";

export interface PricingTier {
  cadence?: string;
  cta: { label: string; href: string };
  featured?: boolean;
  /** Feature limits sourced from packages/backend/convex/billing/pricing.ts */
  features: string[];
  name: string;
  /** PLACEHOLDER — confirm real amounts from Stripe before launch. */
  price: string;
  tagline: string;
}

export const pricingTiers: PricingTier[] = [
  {
    name: "Free",
    price: "$0",
    cadence: "forever",
    tagline: "Everything you need to start your second brain.",
    cta: { label: "Get started", href: links.register },
    features: [
      "500 AI credits / month",
      "100 MB storage",
      "Up to 3 workspaces",
      "Semantic search",
      "Browser, Raycast & mobile capture",
    ],
  },
  {
    name: "Basic",
    price: "$X",
    cadence: "/ month",
    tagline: "For knowledge workers who live in their library.",
    cta: { label: "Start Basic", href: links.register },
    featured: true,
    features: [
      "3,000 AI credits / month",
      "5 GB storage",
      "Unlimited workspaces",
      "AI chat with citations",
      "All integrations & MCP servers",
      "2,000 web captures / month",
    ],
  },
  {
    name: "Pro",
    price: "$Y",
    cadence: "/ month",
    tagline: "For power users and teams that run on knowledge.",
    cta: { label: "Start Pro", href: links.register },
    features: [
      "10,000 AI credits / month",
      "25 GB storage",
      "Unlimited workspaces",
      "Unlimited web captures",
      "Bring your own AI keys",
      "Priority support",
    ],
  },
];
