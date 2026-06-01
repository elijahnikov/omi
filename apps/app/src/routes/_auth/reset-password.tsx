import { createFileRoute } from "@tanstack/react-router";
import ResetPasswordPageComponent from "~/components/pages/auth-pages/reset-password-page";

interface ResetPasswordSearch {
  token?: string;
}

export const Route = createFileRoute("/_auth/reset-password")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): ResetPasswordSearch => {
    const token = typeof search.token === "string" ? search.token : undefined;
    return { token };
  },
});

function RouteComponent() {
  return <ResetPasswordPageComponent />;
}
