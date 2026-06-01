import { Text } from "@react-email/components";
import { linkHintStyle, linkStyle } from "./styles";

/** The "or paste this link into your browser" fallback under a CTA button. */
export function LinkFallback({ url }: { url: string }) {
  return (
    <>
      <Text style={linkHintStyle}>Or paste this link into your browser:</Text>
      <Text style={linkStyle}>{url}</Text>
    </>
  );
}
