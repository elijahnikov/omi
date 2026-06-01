/**
 * Shared inline styles for email templates. Email clients don't reliably
 * support stylesheets, so every style is inlined via these objects.
 */

export const headingStyle = {
  fontSize: "20px",
  margin: "0 0 16px",
};

export const paragraphStyle = {
  lineHeight: "1.5",
  margin: "0 0 16px",
};

export const ctaWrapStyle = {
  margin: "0 0 24px",
};

export const linkHintStyle = {
  color: "#555555",
  fontSize: "13px",
  lineHeight: "1.5",
  margin: "0 0 8px",
};

export const linkStyle = {
  color: "#555555",
  fontSize: "13px",
  margin: "0 0 24px",
  wordBreak: "break-all" as const,
};

export const metaStyle = {
  color: "#555555",
  fontSize: "14px",
  lineHeight: "1.5",
  margin: "0 0 8px",
};
