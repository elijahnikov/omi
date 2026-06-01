import { BillingSubscriptionStartedEmail } from "./index";
import { billingSubscriptionStartedPreviewProps } from "./props";

export default function Preview() {
  return (
    <BillingSubscriptionStartedEmail
      {...billingSubscriptionStartedPreviewProps}
    />
  );
}
