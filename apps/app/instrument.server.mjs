import { nodeProfilingIntegration } from "@sentry/profiling-node";
import * as Sentry from "@sentry/tanstackstart-react";

Sentry.init({
  dsn: "https://99fa688b748190ad4189d2ff367dc40e@o4511441117642752.ingest.us.sentry.io/4511441136058368",
  environment: process.env.NODE_ENV ?? "development",
  sendDefaultPii: true,
  integrations: [nodeProfilingIntegration()],
  tracesSampleRate: 1.0,
  profileSessionSampleRate: 1.0,
  profileLifecycle: "trace",
  enableLogs: true,
});
