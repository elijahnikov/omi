export interface BillingSubscriptionCanceledEmailProps {
  accessUntil?: string;
  name?: string;
  planName?: string;
  resubscribeUrl: string;
}

export const billingSubscriptionCanceledPreviewProps: BillingSubscriptionCanceledEmailProps =
  {
    name: "Ada",
    planName: "Pro",
    accessUntil: "June 30, 2026",
    resubscribeUrl: "https://app.omi.local/settings?tab=billing",
  };
