import { Heading, Text } from "@react-email/components";
import { CTAButton } from "../shared/cta-button";
import { Footer } from "../shared/footer";
import { Layout } from "../shared/layout";
import {
  ctaWrapStyle,
  headingStyle,
  metaStyle,
  paragraphStyle,
} from "../shared/styles";
import type { BillingSubscriptionStartedEmailProps } from "./props";

export type { BillingSubscriptionStartedEmailProps } from "./props";

export const subject = ({
  planName,
}: BillingSubscriptionStartedEmailProps): string => `You're on omi ${planName}`;

export function renderText({
  name,
  planName,
  renewalDate,
  manageUrl,
}: BillingSubscriptionStartedEmailProps): string {
  const greeting = name ? `Hi ${name},` : "Hi,";
  const renews = renewalDate ? `\n\nYour plan renews on ${renewalDate}.` : "";
  return `${greeting}\n\nYou're now on omi ${planName} — thanks for subscribing. Your new limits and features are active right away.${renews}\n\nManage your subscription: ${manageUrl}`;
}

export function BillingSubscriptionStartedEmail({
  name,
  planName,
  renewalDate,
  manageUrl,
}: BillingSubscriptionStartedEmailProps) {
  const greeting = name ? `Hi ${name},` : "Hi,";
  return (
    <Layout preview={`You're on omi ${planName}`}>
      <Heading style={headingStyle}>You're on omi {planName}</Heading>
      <Text style={paragraphStyle}>{greeting}</Text>
      <Text style={paragraphStyle}>
        Thanks for subscribing. Your {planName} limits and features are active
        right away.
      </Text>
      {renewalDate ? (
        <Text style={metaStyle}>Your plan renews on {renewalDate}.</Text>
      ) : null}
      <Text style={ctaWrapStyle}>
        <CTAButton href={manageUrl}>Manage subscription</CTAButton>
      </Text>
      <Footer>
        A receipt for this payment is sent separately by our payment provider.
      </Footer>
    </Layout>
  );
}
