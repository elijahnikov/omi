import { convexQuery } from "@convex-dev/react-query";
import { api } from "@omi/backend/_generated/api.js";
import { Button } from "@omi/ui/button";
import { RiFolderOpenFill } from "@remixicon/react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CreateWorkspaceDialog } from "~/components/common/create-workspace-dialog";
import { EmptyState } from "~/components/common/empty-state";

export const Route = createFileRoute("/")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    if (!context.isAuthenticated) {
      throw redirect({ to: "/login" });
    }
    const { user } = await context.queryClient.ensureQueryData(
      convexQuery(api.user.queries.currentUser, {})
    );
    if (user && user.onboardedAt === undefined) {
      throw redirect({ to: "/onboarding" });
    }
    const workspaces = await context.queryClient.ensureQueryData(
      convexQuery(api.workspace.queries.listByUser, {})
    );
    const target = workspaces[0];
    if (target) {
      throw redirect({
        to: "/workspace/$workspaceId",
        params: { workspaceId: target._id },
      });
    }
  },
});

function RouteComponent() {
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <main className="flex h-screen items-center justify-center">
      <EmptyState
        action={
          <Button onClick={() => setCreateOpen(true)} variant="omi">
            Create workspace
          </Button>
        }
        description="Create a workspace to get started."
        Icon={RiFolderOpenFill}
        title="No workspace yet"
      />
      <CreateWorkspaceDialog
        onCreated={(workspaceId) =>
          navigate({
            to: "/workspace/$workspaceId",
            params: { workspaceId },
          })
        }
        onOpenChange={setCreateOpen}
        open={createOpen}
      />
    </main>
  );
}
