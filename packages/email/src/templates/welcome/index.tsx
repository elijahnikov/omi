import { Heading, Text } from "@react-email/components";
import { CTAButton } from "../shared/cta-button";
import { Footer } from "../shared/footer";
import { Layout } from "../shared/layout";
import { ctaWrapStyle, headingStyle, paragraphStyle } from "../shared/styles";
import type { WelcomeEmailProps } from "./props";

export type { WelcomeEmailProps } from "./props";

export const subject = () => "Welcome to omi";

export function renderText({ name, appUrl }: WelcomeEmailProps): string {
  const greeting = name ? `Hi ${name},` : "Hi,";
  return `${greeting}\n\nWelcome to omi — your account is all set up.\n\nSave anything to your library, organize it into collections, and let omi surface and connect what matters.\n\nOpen omi: ${appUrl}`;
}

export function WelcomeEmail({ name, appUrl }: WelcomeEmailProps) {
  const greeting = name ? `Hi ${name},` : "Hi,";
  return (
    <Layout preview="Welcome to omi — your account is ready">
      <Heading style={headingStyle}>Welcome to omi</Heading>
      <Text style={paragraphStyle}>{greeting}</Text>
      <Text style={paragraphStyle}>
        Your account is all set up. Save anything to your library, organize it
        into collections, and let omi surface and connect what matters.
      </Text>
      <Text style={ctaWrapStyle}>
        <CTAButton href={appUrl}>Open omi</CTAButton>
      </Text>
      <Footer>
        Questions? Just reply to this email and we'll be happy to help.
      </Footer>
    </Layout>
  );
}
