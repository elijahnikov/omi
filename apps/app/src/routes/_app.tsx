import { convexQuery } from "@convex-dev/react-query";
import { api } from "@omi/backend/_generated/api.js";
import {
  CatchBoundary,
  createFileRoute,
  Outlet,
  redirect,
  useRouterState,
} from "@tanstack/react-router";
import { Authenticated } from "convex/react";
import { ErrorState } from "~/components/common/error-state";

export const Route = createFileRoute("/_app")({
  component: AppLayoutComponent,
  beforeLoad: ({ context, location }) => {
    if (!context.isAuthenticated) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
  },
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      convexQuery(api.user.queries.currentUser, {})
    );
  },
});

function AppLayoutComponent() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAccountRoute = pathname.startsWith("/settings");

  return (
    <Authenticated>
      <div
        className={
          isAccountRoute
            ? "min-h-screen bg-ui-bg-subtle"
            : "min-h-screen bg-ui-bg-subtle px-2 pt-2"
        }
      >
        <div
          className={
            isAccountRoute
              ? "relative h-screen overflow-hidden bg-ui-bg-base transition-[background-color,box-shadow] duration-200"
              : "relative min-h-[calc(100vh-8px)] overflow-hidden rounded-t-2xl border-[0.5px] bg-ui-bg-base transition-[background-color,box-shadow] duration-200"
          }
        >
          <main className="h-full flex-1 overflow-y-auto">
            <CatchBoundary
              errorComponent={ErrorState}
              getResetKey={() => pathname}
            >
              <Outlet />
            </CatchBoundary>
          </main>
        </div>
      </div>
    </Authenticated>
  );
}
