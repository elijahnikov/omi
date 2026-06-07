# omi

AI-native personal knowledge management system. Save websites, notes, and files; search semantically; chat with your library; sync from Notion, GitHub, Linear, and Google Drive.

## Monorepo

| Package / App | Description |
|---|---|
| `apps/app` | Main web app (TanStack Start + Convex) — **https://app.omi.ac** |
| `apps/web` | Marketing site — **https://omi.ac** |
| `apps/extension` | Browser extension (capture + save) |
| `apps/raycast` | Raycast extension (search + capture) |
| `apps/mobile` | **Deferred** — scaffold only, not part of GA |
| `packages/backend` | Convex backend (auth, billing, search, AI, sync) |
| `packages/ai` | Embeddings, enrichment, chunking |
| `packages/ui` | Shared UI components |

## Requirements

- [Bun](https://bun.sh) 1.2.14+
- Node.js 22.12+ (matches EAS mobile builds)
- Convex account + CLI

## Setup

```bash
cp .env.example .env
# Fill in Convex, auth, email, AI, and Stripe vars (see .env.example)

bun install
bun run dev
```

Main app: http://localhost:3000  
Marketing: http://localhost:3001

## Scripts

```bash
bun run dev          # All apps (turbo watch)
bun run check        # Lint (ultracite/biome)
bun run typecheck    # Typecheck (excludes mobile)
bun run test         # Backend + AI unit tests
bun run build        # Production builds
```

## Deploy

- **Convex**: `cd packages/backend && bunx convex deploy`
- **App / Web**: Deployed via Vercel (connected to the repo)

## Environment

See [.env.example](.env.example) for the full variable list split by Convex dashboard vs local `.env`.

## License

Private — all rights reserved.
