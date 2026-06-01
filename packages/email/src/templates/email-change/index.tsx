import { Heading, Text } from "@react-email/components";
import { CTAButton } from "../shared/cta-button";
import { Footer } from "../shared/footer";
import { Layout } from "../shared/layout";
import { LinkFallback } from "../shared/link-fallback";
import {
  ctaWrapStyle,
  headingStyle,
  metaStyle,
  paragraphStyle,
} from "../shared/styles";
import type { EmailChangeEmailProps } from "./props";

export type { EmailChangeEmailProps } from "./props";

export const subject = () => "Confirm your email change for omi";

export function renderText({
  name,
  newEmail,
  url,
}: EmailChangeEmailProps): string {
  const greeting = name ? `Hi ${name},` : "Hi,";
  return `${greeting}\n\nWe received a request to change the email on your omi account to ${newEmail}. Approve the change by opening the link below:\n\n${url}\n\nIf you didn't request this, do not approve it — and please contact support, as your account may be at risk.`;
}

export function EmailChangeEmail({
  name,
  newEmail,
  url,
}: EmailChangeEmailProps) {
  const greeting = name ? `Hi ${name},` : "Hi,";
  return (
    <Layout preview="Confirm your email change for omi">
      <Heading style={headingStyle}>Confirm your email change</Heading>
      <Text style={paragraphStyle}>{greeting}</Text>
      <Text style={paragraphStyle}>
        We received a request to change the email on your omi account to:
      </Text>
      <Text style={metaStyle}>
        <strong>{newEmail}</strong>
      </Text>
      <Text style={paragraphStyle}>
        Approve the change with the button below. We sent this to your current
        address for security.
      </Text>
      <Text style={ctaWrapStyle}>
        <CTAButton href={url}>Confirm change</CTAButton>
      </Text>
      <LinkFallback url={url} />
      <Footer>
        If you didn't request this, do not approve it — and please contact
        support, as your account may be at risk.
      </Footer>
    </Layout>
  );
}
