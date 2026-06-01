import { Heading, Text } from "@react-email/components";
import { CTAButton } from "../shared/cta-button";
import { Footer } from "../shared/footer";
import { Layout } from "../shared/layout";
import { LinkFallback } from "../shared/link-fallback";
import { ctaWrapStyle, headingStyle, paragraphStyle } from "../shared/styles";
import type { VerificationEmailProps } from "./props";

export type { VerificationEmailProps } from "./props";

export const subject = () => "Verify your email for omi";

export function renderText({ url, name }: VerificationEmailProps): string {
  const greeting = name ? `Hi ${name},` : "Hi,";
  return `${greeting}\n\nVerify your email for omi by opening the link below:\n\n${url}\n\nIf you didn't sign up, you can safely ignore this message.`;
}

export function VerificationEmail({ url, name }: VerificationEmailProps) {
  const greeting = name ? `Hi ${name},` : "Hi,";
  return (
    <Layout preview="Verify your email for omi">
      <Heading style={headingStyle}>Verify your email</Heading>
      <Text style={paragraphStyle}>{greeting}</Text>
      <Text style={paragraphStyle}>
        Tap the button below to verify your email address and finish setting up
        your omi account.
      </Text>
      <Text style={ctaWrapStyle}>
        <CTAButton href={url}>Verify email</CTAButton>
      </Text>
      <LinkFallback url={url} />
      <Footer>
        If you didn't sign up for omi, you can safely ignore this email.
      </Footer>
    </Layout>
  );
}
