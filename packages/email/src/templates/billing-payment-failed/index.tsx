import { Heading, Text } from "@react-email/components";
import { CTAButton } from "../shared/cta-button";
import { Footer } from "../shared/footer";
import { Layout } from "../shared/layout";
import { ctaWrapStyle, headingStyle, paragraphStyle } from "../shared/styles";
import type { BillingPaymentFailedEmailProps } from "./props";

export type { BillingPaymentFailedEmailProps } from "./props";

export const subject = () => "Your omi payment didn't go through";

export function renderText({
  name,
  planName,
  updatePaymentUrl,
}: BillingPaymentFailedEmailProps): string {
  const greeting = name ? `Hi ${name},` : "Hi,";
  const plan = planName ? ` ${planName}` : "";
  return `${greeting}\n\nWe couldn't process the payment for your omi${plan} subscription. To avoid losing access, please update your payment method:\n\n${updatePaymentUrl}\n\nWe'll retry automatically, but updating your details is the fastest way to stay active.`;
}

export function BillingPaymentFailedEmail({
  name,
  planName,
  updatePaymentUrl,
}: BillingPaymentFailedEmailProps) {
  const greeting = name ? `Hi ${name},` : "Hi,";
  const plan = planName ? ` ${planName}` : "";
  return (
    <Layout preview="Your omi payment didn't go through">
      <Heading style={headingStyle}>Payment failed</Heading>
      <Text style={paragraphStyle}>{greeting}</Text>
      <Text style={paragraphStyle}>
        We couldn't process the payment for your omi{plan} subscription. To
        avoid losing access, please update your payment method.
      </Text>
      <Text style={ctaWrapStyle}>
        <CTAButton href={updatePaymentUrl}>Update payment method</CTAButton>
      </Text>
      <Footer>
        We'll retry automatically, but updating your details is the fastest way
        to stay active.
      </Footer>
    </Layout>
  );
}
