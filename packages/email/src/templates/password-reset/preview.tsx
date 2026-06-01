import { PasswordResetEmail } from "./index";
import { passwordResetPreviewProps } from "./props";

export default function Preview() {
  return <PasswordResetEmail {...passwordResetPreviewProps} />;
}
