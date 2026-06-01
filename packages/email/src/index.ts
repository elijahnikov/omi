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

export async function renderEmail<Id extends EmailTemplateId>(
  id: Id,
  props: EmailProps<Id>
): Promise<{ subject: string; html: string; text: string }> {
  const def = emailRegistry[id] as EmailDefinition<EmailProps<Id>>;

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
