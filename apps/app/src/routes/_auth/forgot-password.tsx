import { createFileRoute } from "@tanstack/react-router";
import ForgotPasswordPageComponent from "~/components/pages/auth-pages/forgot-password-page";

export const Route = createFileRoute("/_auth/forgot-password")({
  component: RouteComponent,
});

function RouteComponent() {
  return <ForgotPasswordPageComponent />;
}
