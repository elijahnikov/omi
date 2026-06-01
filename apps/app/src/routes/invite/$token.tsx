import { createFileRoute } from "@tanstack/react-router";
import { InvitePage } from "~/components/pages/invite-page";

export const Route = createFileRoute("/invite/$token")({
  component: InvitePage,
});
