export interface BillingSubscriptionStartedEmailProps {
  manageUrl: string;
  name?: string;
  planName: string;
  renewalDate?: string;
}

export const billingSubscriptionStartedPreviewProps: BillingSubscriptionStartedEmailProps =
  {
    name: "Ada",
    planName: "Pro",
    renewalDate: "June 30, 2026",
    manageUrl: "https://app.omi.local/settings?tab=billing",
  };
