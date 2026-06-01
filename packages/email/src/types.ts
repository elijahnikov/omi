import type { ComponentType } from "react";

/**
 * A single transactional email, authored once as a React component. The same
 * `Component` is rendered both by `react-email dev` (preview) and by the
 * backend send path via `renderEmail`, so there is no second copy to keep in
 * sync.
 */
export interface EmailDefinition<P> {
  /** The JSX component — the single source of truth for the email body. */
  Component: ComponentType<P>;
  /** Plain-text alternative for clients that don't render HTML. */
  renderText: (props: P) => string;
  /** Subject line; a function so it can incorporate props. */
  subject: (props: P) => string;
}
