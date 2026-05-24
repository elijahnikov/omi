import { convexQuery } from "@convex-dev/react-query";
import { api } from "@omi/backend/_generated/api.js";
import type { Id } from "@omi/backend/_generated/dataModel.js";
import { Button } from "@omi/ui/button";
import * as Sentry from "@sentry/tanstackstart-react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ErrorState } from "~/components/common/error-state";
import { HomePageComponent } from "~/components/pages/home-page";

const RECENT_LIMIT = 8;

export const Route = createFileRoute("/_workspace/workspace/$workspaceId/")({
  loader: async ({ context, params }) => {
    const workspaceId = params.workspaceId as Id<"workspace">;
    await Promise.all([
      context.queryClient.ensureQueryData(
        convexQuery(api.home.queries.getHome, { workspaceId })
      ),
      context.queryClient.ensureQueryData(
        convexQuery(api.resource.queries.listRecent, {
          workspaceId,
          limit: RECENT_LIMIT,
        })
      ),
    ]);
  },
  component: WorkspaceHomePage,
  errorComponent: ({ error, reset }) => {
    useEffect(() => {
      Sentry.captureException(error);
    }, [error]);

    return <ErrorState error={error} reset={reset} />;
  },
});

function WorkspaceHomePage() {
  const { workspaceId } = Route.useParams();
  const { data: currentUser } = useQuery(
    convexQuery(api.user.queries.currentUser, {})
  );
  const [shouldThrow, setShouldThrow] = useState(false);

  if (shouldThrow) {
    throw new Error("Sentry test: thrown from WorkspaceHomePage");
  }

  const username = currentUser?.user?.username ?? "there";

  return (
    <>
      <div className="p-4">
        <Button onClick={() => setShouldThrow(true)} variant="destructive">
          Throw test error (Sentry)
        </Button>
      </div>
      <HomePageComponent
        username={username}
        workspaceId={workspaceId as Id<"workspace">}
      />
    </>
  );
}
