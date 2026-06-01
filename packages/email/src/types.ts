import type { ComponentType } from "react";

export interface EmailDefinition<P> {
  /** The JSX component — the single source of truth for the email body. */
  Component: ComponentType<P>;
  /** Plain-text alternative for clients that don't render HTML. */
  renderText: (props: P) => string;
  /** Subject line; a function so it can incorporate props. */
  subject: (props: P) => string;
}
