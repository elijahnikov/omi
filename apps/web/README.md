# omi marketing site

Next.js marketing site for [omi.ac](https://omi.ac). CTAs point to the main app at **https://app.omi.ac**.

## Dev

```bash
# From repo root
bun run dev --filter=@omi/web
```

Runs on http://localhost:3001.

## Build

```bash
bun run build --filter=@omi/web
```

Set `NEXT_PUBLIC_APP_URL=https://app.omi.ac` in production.

## Deploy

Deployed via Vercel. CI runs `bun run build` on every PR.
