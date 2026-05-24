import { sentryTanstackStart } from "@sentry/tanstackstart-react/vite";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    port: 3000,
    headers: {
      "Document-Policy": "js-profiling",
    },
  },
  plugins: [
    tsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    nitro(),
    tanstackStart(),
    viteReact(),
    tailwindcss(),
    sentryTanstackStart({
      org: "omi-0b",
      project: "omi-app",
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
  ],
  ssr: {
    noExternal: ["@convex-dev/better-auth", /react-tweet.*/],
  },
});
