export function getSentryDsn(): string | undefined {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  return typeof dsn === "string" && dsn.length > 0 ? dsn : undefined;
}

export function getSentrySampleRates(isDev: boolean) {
  return {
    tracesSampleRate: isDev ? 1.0 : 0.1,
    profileSessionSampleRate: isDev ? 1.0 : 0.1,
  };
}

export function shouldInitSentry(dsn: string | undefined): dsn is string {
  return typeof dsn === "string" && dsn.length > 0;
}
