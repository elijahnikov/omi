import { useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { initAnalytics, trackPageView } from "~/lib/analytics";

export function AnalyticsListener() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);

  return null;
}
