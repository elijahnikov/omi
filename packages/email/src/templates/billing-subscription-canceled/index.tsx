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
import type { BillingSubscriptionCanceledEmailProps } from "./props";

export type { BillingSubscriptionCanceledEmailProps } from "./props";

export const subject = () => "Your omi subscription was canceled";

export function renderText({
  name,
  planName,
  accessUntil,
  resubscribeUrl,
}: BillingSubscriptionCanceledEmailProps): string {
  const greeting = name ? `Hi ${name},` : "Hi,";
  const plan = planName ? ` ${planName}` : "";
  const access = accessUntil
    ? `\n\nYou'll keep your${plan} features until ${accessUntil}, then your account moves to the free plan.`
    : "\n\nYour account has moved to the free plan.";
  return `${greeting}\n\nYour omi${plan} subscription has been canceled.${access}\n\nChanged your mind? You can resubscribe any time: ${resubscribeUrl}`;
}

export function BillingSubscriptionCanceledEmail({
  name,
  planName,
  accessUntil,
  resubscribeUrl,
}: BillingSubscriptionCanceledEmailProps) {
  const greeting = name ? `Hi ${name},` : "Hi,";
  const plan = planName ? ` ${planName}` : "";
  return (
    <Layout preview="Your omi subscription was canceled">
      <Heading style={headingStyle}>Subscription canceled</Heading>
      <Text style={paragraphStyle}>{greeting}</Text>
      <Text style={paragraphStyle}>
        Your omi{plan} subscription has been canceled.
      </Text>
      <Text style={metaStyle}>
        {accessUntil
          ? `You'll keep your${plan} features until ${accessUntil}, then your account moves to the free plan.`
          : "Your account has moved to the free plan."}
      </Text>
      <Text style={ctaWrapStyle}>
        <CTAButton href={resubscribeUrl}>Resubscribe</CTAButton>
      </Text>
      <Footer>Changed your mind? You can resubscribe any time.</Footer>
    </Layout>
  );
}
