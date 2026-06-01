import { WelcomeEmail } from "./index";
import { welcomePreviewProps } from "./props";

export default function Preview() {
  return <WelcomeEmail {...welcomePreviewProps} />;
}
