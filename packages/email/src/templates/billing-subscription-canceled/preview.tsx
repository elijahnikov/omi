import { BillingSubscriptionCanceledEmail } from "./index";
import { billingSubscriptionCanceledPreviewProps } from "./props";

export default function Preview() {
  return (
    <BillingSubscriptionCanceledEmail
      {...billingSubscriptionCanceledPreviewProps}
    />
  );
}
