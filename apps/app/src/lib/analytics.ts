const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const POSTHOG_HOST =
  (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ??
  "https://us.i.posthog.com";

let distinctId: string | null = null;

function getDistinctId(): string {
  if (distinctId) {
    return distinctId;
  }
  if (typeof window === "undefined") {
    return "server";
  }
  const stored = window.localStorage.getItem("omi_analytics_id");
  if (stored) {
    distinctId = stored;
    return stored;
  }
  const generated = crypto.randomUUID();
  window.localStorage.setItem("omi_analytics_id", generated);
  distinctId = generated;
  return generated;
}

async function capture(
  event: string,
  properties?: Record<string, unknown>
): Promise<void> {
  if (!POSTHOG_KEY || import.meta.env.SSR) {
    return;
  }
  try {
    await fetch(`${POSTHOG_HOST}/capture/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: POSTHOG_KEY,
        event,
        properties: {
          ...properties,
          distinct_id: getDistinctId(),
          $lib: "omi-web",
        },
      }),
      keepalive: true,
    });
  } catch {
    // Analytics must never break the app.
  }
}

export function initAnalytics() {
  void capture("$pageview");
}

export function trackEvent(
  event: string,
  properties?: Record<string, unknown>
) {
  void capture(event, properties);
}

export function identifyUser(
  userId: string,
  properties?: Record<string, unknown>
) {
  distinctId = userId;
  if (typeof window !== "undefined") {
    window.localStorage.setItem("omi_analytics_id", userId);
  }
  void capture("$identify", { userId, ...properties });
}

export function resetAnalytics() {
  distinctId = null;
  if (typeof window !== "undefined") {
    window.localStorage.removeItem("omi_analytics_id");
  }
}

export function trackPageView(path: string) {
  void capture("$pageview", { path });
}
