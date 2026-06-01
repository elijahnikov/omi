import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { authClient } from "@omi/auth/client";
import { api } from "@omi/backend/_generated/api.js";
import { Button } from "@omi/ui/button";
import { LoadingButton } from "@omi/ui/loading-button";
import { Text } from "@omi/ui/text";
import { toastManager } from "@omi/ui/toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

function InviteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6">
      <div className="flex w-full max-w-sm flex-col gap-6 text-center">
        {children}
      </div>
    </div>
  );
}

export function InvitePage() {
  const { token } = useParams({ from: "/invite/$token" });
  const navigate = useNavigate();
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const acceptedRef = useRef(false);
  const [accepting, setAccepting] = useState(false);

  const { data: invitation, isLoading } = useQuery(
    convexQuery(api.workspace.queries.getInvitationByToken, { token })
  );

  const { mutateAsync: acceptInvitation } = useMutation({
    mutationFn: useConvexMutation(
      api.workspace.mutations.acceptInvitationByToken
    ),
  });

  const sessionEmail = session?.user.email ?? null;
  const isAuthed = Boolean(sessionEmail);
  const emailMatches =
    invitation != null && sessionEmail === invitation.invitedEmail;
  const isAcceptable =
    invitation != null &&
    invitation.status === "pending" &&
    !invitation.expired;

  const handleAccept = async () => {
    setAccepting(true);
    try {
      const { workspaceId } = await acceptInvitation({ token });
      toastManager.add({ type: "success", title: "Invitation accepted" });
      navigate({ to: "/workspace/$workspaceId", params: { workspaceId } });
    } catch (err) {
      setAccepting(false);
      acceptedRef.current = false;
      toastManager.add({
        type: "error",
        title:
          err instanceof Error ? err.message : "Could not accept invitation",
      });
    }
  };

  // Auto-accept once the invitee is signed in with the matching email. This
  // makes returning from the login redirect a single click for them.
  // biome-ignore lint/correctness/useExhaustiveDependencies: handleAccept is recreated each render; the acceptedRef guard makes this a one-shot.
  useEffect(() => {
    if (
      isAuthed &&
      emailMatches &&
      isAcceptable &&
      !acceptedRef.current &&
      !accepting
    ) {
      acceptedRef.current = true;
      void handleAccept();
    }
  }, [isAuthed, emailMatches, isAcceptable, accepting]);

  if (sessionLoading || isLoading) {
    return (
      <InviteShell>
        <Text className="text-ui-fg-muted" size="small">
          Loading invitation…
        </Text>
      </InviteShell>
    );
  }

  if (!invitation) {
    return (
      <InviteShell>
        <h1 className="font-semibold text-xl">Invitation not found</h1>
        <Text className="text-ui-fg-muted" size="small">
          This invitation link is invalid. Ask the workspace owner to send a new
          one.
        </Text>
      </InviteShell>
    );
  }

  if (!isAcceptable) {
    const reason =
      invitation.status === "accepted"
        ? "This invitation has already been accepted."
        : invitation.expired
          ? "This invitation has expired."
          : "This invitation is no longer available.";
    return (
      <InviteShell>
        <h1 className="font-semibold text-xl">Invitation unavailable</h1>
        <Text className="text-ui-fg-muted" size="small">
          {reason}
        </Text>
        <Link className="text-sm text-ui-fg-base underline" to="/">
          Go to omi
        </Link>
      </InviteShell>
    );
  }

  const workspaceLabel = invitation.workspaceName ?? "a workspace";

  if (isAuthed && !emailMatches) {
    return (
      <InviteShell>
        <h1 className="font-semibold text-xl">Wrong account</h1>
        <Text className="text-ui-fg-muted" size="small">
          This invitation was sent to {invitation.invitedEmail}, but you're
          signed in as {sessionEmail}. Sign out and sign back in with the
          invited email to join {workspaceLabel}.
        </Text>
        <Button
          onClick={() => authClient.signOut()}
          type="button"
          variant="secondary"
        >
          Sign out
        </Button>
      </InviteShell>
    );
  }

  if (isAuthed) {
    return (
      <InviteShell>
        <h1 className="font-semibold text-xl">Join {workspaceLabel}</h1>
        <Text className="text-ui-fg-muted" size="small">
          {invitation.inviterName
            ? `${invitation.inviterName} invited you to join ${workspaceLabel}.`
            : `You've been invited to join ${workspaceLabel}.`}
        </Text>
        <LoadingButton
          loading={accepting}
          onClick={handleAccept}
          type="button"
          variant="omi"
        >
          Accept invitation
        </LoadingButton>
      </InviteShell>
    );
  }

  // Logged out: send them to sign up (most invitees are new) or sign in,
  // carrying the invite link so they return here to accept afterwards.
  const redirectTo = `/invite/${token}`;
  return (
    <InviteShell>
      <h1 className="font-semibold text-xl">Join {workspaceLabel}</h1>
      <Text className="text-ui-fg-muted" size="small">
        {invitation.inviterName
          ? `${invitation.inviterName} invited ${invitation.invitedEmail} to join ${workspaceLabel}.`
          : `${invitation.invitedEmail} has been invited to join ${workspaceLabel}.`}{" "}
        Create an account or sign in with that email to accept.
      </Text>
      <div className="flex flex-col gap-2">
        <Link to="/register">
          <Button className="w-full" type="button" variant="omi">
            Create account
          </Button>
        </Link>
        <Link search={{ redirect: redirectTo }} to="/login">
          <Button className="w-full" type="button" variant="secondary">
            Sign in
          </Button>
        </Link>
      </div>
    </InviteShell>
  );
}
