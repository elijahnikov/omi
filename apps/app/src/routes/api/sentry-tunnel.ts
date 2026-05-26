import { createFileRoute } from "@tanstack/react-router";

const SENTRY_HOST = "o4511441117642752.ingest.us.sentry.io";
const SENTRY_PROJECT_IDS = new Set(["4511441136058368"]);
const dsnRegex = /^\//;

export const Route = createFileRoute("/api/sentry-tunnel")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const envelope = await request.text();
        const piece = envelope.split("\n", 1)[0];
        if (!piece) {
          return new Response("Empty envelope", { status: 400 });
        }

        let header: { dsn?: string };
        try {
          header = JSON.parse(piece);
        } catch {
          return new Response("Invalid envelope header", { status: 400 });
        }

        if (!header.dsn) {
          return new Response("Missing DSN", { status: 400 });
        }

        const dsn = new URL(header.dsn);
        const projectId = dsn.pathname.replace(dsnRegex, "");

        if (dsn.hostname !== SENTRY_HOST) {
          return new Response("Invalid Sentry host", { status: 400 });
        }
        if (!SENTRY_PROJECT_IDS.has(projectId)) {
          return new Response("Invalid Sentry project", { status: 400 });
        }

        const upstream = `https://${SENTRY_HOST}/api/${projectId}/envelope/`;
        const res = await fetch(upstream, {
          method: "POST",
          body: envelope,
          headers: { "Content-Type": "application/x-sentry-envelope" },
        });

        return new Response(null, { status: res.status });
      },
    },
  },
});
