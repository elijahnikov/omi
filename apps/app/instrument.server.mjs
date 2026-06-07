import { nodeProfilingIntegration } from "@sentry/profiling-node";
import * as Sentry from "@sentry/tanstackstart-react";

const dsn = process.env.SENTRY_DSN ?? process.env.VITE_SENTRY_DSN;
const isDev = (process.env.NODE_ENV ?? "development") !== "production";

if (typeof dsn === "string" && dsn.length > 0) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV ?? "development",
    sendDefaultPii: false,
    integrations: [nodeProfilingIntegration()],
    tracesSampleRate: isDev ? 1.0 : 0.1,
    profileSessionSampleRate: isDev ? 1.0 : 0.1,
    profileLifecycle: "trace",
    enableLogs: true,
  });
}
