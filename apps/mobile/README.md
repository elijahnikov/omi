# @omi/mobile

**Not part of GA.** This app is still the default T3 Turbo Expo scaffold and is not wired to the omi Convex backend.

Mobile is deferred until a dedicated rebuild. The workspace excludes this package from root `typecheck` (`package.json`: `--filter=!@omi/mobile`).

When rebuilding:

1. Replace auth with `@omi/auth` + Convex (match `apps/app`)
2. Implement library, search, capture, and chat against `@omi/backend`
3. Re-enable in CI typecheck and align Node with root `engines` (22.12+)

EAS config: `eas.json` (Node 22.12.0).
