import { convexQuery } from "@convex-dev/react-query";
import { api } from "@omi/backend/_generated/api.js";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Authenticated } from "convex/react";
import { GlobalLayout } from "~/components/common/global-workspace-layout";
import { consumeIntentionalSignOut } from "~/lib/sign-out";

export const Route = createFileRoute("/_workspace")({
  component: WorkspaceLayoutComponent,
  pendingComponent: PendingComponent,
  beforeLoad: ({ context, location }) => {
    if (!context.isAuthenticated) {
      if (consumeIntentionalSignOut()) {
        throw redirect({ to: "/login" });
      }
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

function PendingComponent() {
  return (
    <Authenticated>
      <GlobalLayout>
        <div />
      </GlobalLayout>
    </Authenticated>
  );
}

function WorkspaceLayoutComponent() {
  return (
    <Authenticated>
      <GlobalLayout>
        <Outlet />
      </GlobalLayout>
    </Authenticated>
  );
}
