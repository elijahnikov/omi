export interface WorkspaceInvitationEmailProps {
  inviterName?: string;
  url: string;
  workspaceName: string;
}

export const workspaceInvitationPreviewProps: WorkspaceInvitationEmailProps = {
  inviterName: "Ada Lovelace",
  workspaceName: "Research",
  url: "https://app.omi.local/invite/preview-token",
};
