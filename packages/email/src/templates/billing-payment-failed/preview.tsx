import { BillingPaymentFailedEmail } from "./index";
import { billingPaymentFailedPreviewProps } from "./props";

export default function Preview() {
  return <BillingPaymentFailedEmail {...billingPaymentFailedPreviewProps} />;
}
