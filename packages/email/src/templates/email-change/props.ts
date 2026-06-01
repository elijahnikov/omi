export interface EmailChangeEmailProps {
  name?: string;
  newEmail: string;
  url: string;
}

export const emailChangePreviewProps: EmailChangeEmailProps = {
  name: "Ada",
  newEmail: "ada.new@example.com",
  url: "https://app.omi.local/verify-email?token=preview-token",
};
