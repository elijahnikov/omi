import type { SVGProps } from "react";

/**
 * Simplified, monochrome brand glyphs (currentColor) for the integrations
 * field. Decorative — callers provide an accessible label.
 */

type IconProps = SVGProps<SVGSVGElement>;

export function OmiMark(props: IconProps) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <circle cx="12" cy="12" fill="currentColor" opacity="0.9" r="9" />
      <circle cx="12" cy="12" fill="var(--card)" r="4.2" />
    </svg>
  );
}

export function GitHubIcon(props: IconProps) {
  return (
    <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path
        clipRule="evenodd"
        d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49v-1.71c-2.78.62-3.37-1.37-3.37-1.37-.46-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.57 2.34 1.12 2.91.85.09-.66.35-1.12.63-1.37-2.22-.26-4.55-1.14-4.55-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05a9.3 9.3 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.79-4.57 5.05.36.32.68.94.68 1.9v2.82c0 .27.18.6.69.49A10.26 10.26 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z"
        fillRule="evenodd"
      />
    </svg>
  );
}

export function NotionIcon(props: IconProps) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" {...props}>
      <rect
        height="18"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.6"
        width="18"
        x="3"
        y="3"
      />
      <path
        d="M8 16.5v-9l8 9v-9"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

export function SlackIcon(props: IconProps) {
  return (
    <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="M9.5 3a2 2 0 0 0 0 4h2V5a2 2 0 0 0-2-2Zm0 6H4a2 2 0 1 0 0 4h5.5a2 2 0 1 0 0-4Z" />
      <path d="M21 9.5a2 2 0 0 0-4 0v2h2a2 2 0 0 0 2-2Zm-6 0V4a2 2 0 1 0-4 0v5.5a2 2 0 1 0 4 0Z" />
      <path d="M14.5 21a2 2 0 0 0 0-4h-2v2a2 2 0 0 0 2 2Zm0-6H20a2 2 0 1 0 0-4h-5.5a2 2 0 1 0 0 4Z" />
      <path d="M3 14.5a2 2 0 0 0 4 0v-2H5a2 2 0 0 0-2 2Zm6 0V20a2 2 0 1 0 4 0v-5.5a2 2 0 1 0-4 0Z" />
    </svg>
  );
}

export function LinearIcon(props: IconProps) {
  return (
    <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="M3.06 13.5a9 9 0 0 0 7.44 7.44L3.06 13.5Zm-.06-2.2L12.7 21a9 9 0 0 0 2.46-.49L3.49 8.84A9 9 0 0 0 3 11.3Zm1.2-4.05 11.6 11.6a9.06 9.06 0 0 0 1.85-1.45L5.65 5.4A9.06 9.06 0 0 0 4.2 7.25Zm2.9-2.45a9 9 0 0 1 12.1 12.1L7.1 4.8Z" />
    </svg>
  );
}

export function GoogleDriveIcon(props: IconProps) {
  return (
    <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24" {...props}>
      <path d="m8.5 3 7 12.1-3.5 6.05L5 9.05 8.5 3Z" opacity="0.55" />
      <path d="m22 15.1-3.5 6.05H5l3.5-6.05H22Z" opacity="0.85" />
      <path d="M15.5 15.1H22L15.5 3.95 9 15.1h6.5Z" />
    </svg>
  );
}
