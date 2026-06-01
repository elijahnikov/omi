export interface VerificationEmailProps {
  name?: string;
  url: string;
}

export const verificationPreviewProps: VerificationEmailProps = {
  url: "https://app.omi.local/verify-email?token=preview-token",
  name: "Ada",
};
