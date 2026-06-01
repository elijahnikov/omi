import { Heading, Text } from "@react-email/components";
import { CTAButton } from "../shared/cta-button";
import { Footer } from "../shared/footer";
import { Layout } from "../shared/layout";
import { LinkFallback } from "../shared/link-fallback";
import { ctaWrapStyle, headingStyle, paragraphStyle } from "../shared/styles";
import type { WorkspaceInvitationEmailProps } from "./props";

export type { WorkspaceInvitationEmailProps } from "./props";

export const subject = ({
  inviterName,
  workspaceName,
}: WorkspaceInvitationEmailProps): string =>
  inviterName
    ? `${inviterName} invited you to ${workspaceName} on omi`
    : `You've been invited to ${workspaceName} on omi`;

export function renderText({
  inviterName,
  workspaceName,
  url,
}: WorkspaceInvitationEmailProps): string {
  const who = inviterName ?? "Someone";
  return `${who} invited you to join the "${workspaceName}" workspace on omi.\n\nAccept the invitation by opening the link below:\n\n${url}\n\nIf you weren't expecting this, you can safely ignore this email.`;
}

export function WorkspaceInvitationEmail({
  inviterName,
  workspaceName,
  url,
}: WorkspaceInvitationEmailProps) {
  const who = inviterName ?? "Someone";
  return (
    <Layout preview={`Join ${workspaceName} on omi`}>
      <Heading style={headingStyle}>You've been invited</Heading>
      <Text style={paragraphStyle}>
        {who} invited you to join the <strong>{workspaceName}</strong> workspace
        on omi.
      </Text>
      <Text style={ctaWrapStyle}>
        <CTAButton href={url}>Accept invitation</CTAButton>
      </Text>
      <LinkFallback url={url} />
      <Footer>
        If you weren't expecting this, you can safely ignore this email.
      </Footer>
    </Layout>
  );
}
