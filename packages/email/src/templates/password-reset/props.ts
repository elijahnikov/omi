export interface PasswordResetEmailProps {
  name?: string;
  url: string;
}

export const passwordResetPreviewProps: PasswordResetEmailProps = {
  name: "Ada",
  url: "https://app.omi.local/reset-password?token=preview-token",
};
