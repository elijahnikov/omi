import { Heading, Text } from "@react-email/components";
import { CTAButton } from "../shared/cta-button";
import { Footer } from "../shared/footer";
import { Layout } from "../shared/layout";
import { LinkFallback } from "../shared/link-fallback";
import { ctaWrapStyle, headingStyle, paragraphStyle } from "../shared/styles";
import type { PasswordResetEmailProps } from "./props";

export type { PasswordResetEmailProps } from "./props";

export const subject = () => "Reset your omi password";

export function renderText({ name, url }: PasswordResetEmailProps): string {
  const greeting = name ? `Hi ${name},` : "Hi,";
  return `${greeting}\n\nWe received a request to reset your omi password. Open the link below to choose a new one:\n\n${url}\n\nIf you didn't request this, you can safely ignore this email — your password won't change.`;
}

export function PasswordResetEmail({ name, url }: PasswordResetEmailProps) {
  const greeting = name ? `Hi ${name},` : "Hi,";
  return (
    <Layout preview="Reset your omi password">
      <Heading style={headingStyle}>Reset your password</Heading>
      <Text style={paragraphStyle}>{greeting}</Text>
      <Text style={paragraphStyle}>
        We received a request to reset your omi password. Tap the button below
        to choose a new one.
      </Text>
      <Text style={ctaWrapStyle}>
        <CTAButton href={url}>Reset password</CTAButton>
      </Text>
      <LinkFallback url={url} />
      <Footer>
        If you didn't request a password reset, you can safely ignore this email
        — your password won't change.
      </Footer>
    </Layout>
  );
}
