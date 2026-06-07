import type { ComponentType, SVGProps } from "react";
import {
  GitHubIcon,
  GoogleDriveIcon,
  LinearIcon,
  NotionIcon,
  SlackIcon,
} from "~/components/marketing/brand-icons";

export interface Integration {
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  name: string;
}

/** Real `connection` providers from the backend, plus surfaces users expect. */
export const integrations: Integration[] = [
  { name: "Notion", Icon: NotionIcon },
  { name: "GitHub", Icon: GitHubIcon },
  { name: "Linear", Icon: LinearIcon },
  { name: "Google Drive", Icon: GoogleDriveIcon },
  { name: "Slack", Icon: SlackIcon },
];
