export interface BillingPaymentFailedEmailProps {
  name?: string;
  planName?: string;
  updatePaymentUrl: string;
}

export const billingPaymentFailedPreviewProps: BillingPaymentFailedEmailProps =
  {
    name: "Ada",
    planName: "Pro",
    updatePaymentUrl: "https://app.omi.local/settings?tab=billing",
  };
