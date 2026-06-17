import { AuthBoundary } from "@convex-dev/better-auth/react";
import { convexQuery } from "@convex-dev/react-query";
import { authClient } from "@omi/auth/client";
import { api } from "@omi/backend/_generated/api.js";
import { isUnauthenticatedError } from "@omi/backend/shared.js";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "@tanstack/react-router";
import type { PropsWithChildren } from "react";

const PUBLIC_PATHS = new Set<string>([
  "/login",
  "/register",
  "/verify-email",
  "/connect-extension",
]);

export const ClientAuthBoundary = ({ children }: PropsWithChildren) => {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <AuthBoundary
      authClient={authClient}
      getAuthUserFn={api.user.queries.currentUser}
      isAuthError={isUnauthenticatedError}
      onUnauth={() => {
        if (PUBLIC_PATHS.has(location.pathname)) {
          return;
        }
        navigate({ to: "/login" });
      }}
    >
      <AuthReadyGate>{children}</AuthReadyGate>
    </AuthBoundary>
  );
};

function AuthReadyGate({ children }: PropsWithChildren) {
  const location = useLocation();
  const isPublicPath = PUBLIC_PATHS.has(location.pathname);
  const { data } = useQuery({
    ...convexQuery(api.user.queries.currentUser, isPublicPath ? "skip" : {}),
  });

  if (isPublicPath || data?.user) {
    return children;
  }

  return null;
}
