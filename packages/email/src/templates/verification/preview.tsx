import { VerificationEmail } from "./index";
import { verificationPreviewProps } from "./props";

export default function Preview() {
  return <VerificationEmail {...verificationPreviewProps} />;
}
