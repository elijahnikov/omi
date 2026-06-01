export interface WelcomeEmailProps {
  appUrl: string;
  name?: string;
}

export const welcomePreviewProps: WelcomeEmailProps = {
  name: "Ada",
  appUrl: "https://app.omi.local",
};
