import { render } from "@react-email/render";
import { type ComponentType, createElement } from "react";
import {
  type EmailProps,
  type EmailTemplateId,
  emailRegistry,
} from "./registry";
import type { EmailDefinition } from "./types";

export type { EmailProps, EmailTemplateId } from "./registry";
export { emailRegistry } from "./registry";
export { render } from "./render";
export { senders } from "./senders";
export type { EmailDefinition } from "./types";

/**
 * Render a registered email to `{ subject, html, text }`.
 *
 * Uses the real `@react-email/render`, which needs a Node runtime (it relies on
 * `react-dom/server`, which the Convex V8 isolate can't run). Call it from a
 * Convex `"use node"` action, not a plain mutation/query.
 */
export async function renderEmail<Id extends EmailTemplateId>(
  id: Id,
  props: EmailProps<Id>
): Promise<{ subject: string; html: string; text: string }> {
  const def = emailRegistry[id] as EmailDefinition<EmailProps<Id>>;
  // The component's props are correct for `id`, but TypeScript can't verify the
  // generic against `createElement`'s overloads, so we widen at this boundary
  // only. `renderEmail`'s public signature stays strict.
  const Component = def.Component as ComponentType<Record<string, unknown>>;
  const html = await render(
    createElement(Component, props as unknown as Record<string, unknown>)
  );
  return {
    subject: def.subject(props),
    html,
    text: def.renderText(props),
  };
}
