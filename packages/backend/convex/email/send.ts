"use node";

import {
  type EmailProps,
  type EmailTemplateId,
  renderEmail,
  senders,
} from "@omi/email";
import { v } from "convex/values";
import { type ActionCtx, internalAction } from "../_generated/server";
import { resend } from "./resend";

/**
 * Render a registered email and enqueue it via Resend. Runs in a Node action
 * because `renderEmail` uses `react-dom/server`, which the Convex V8 isolate
 * can't run. `resend.sendEmail` works from an action — it only needs
 * `runMutation`, which `ActionCtx` provides.
 *
 * Per-template wrappers below are the public surface. Their typed args flow
 * into `props`, so `EmailProps<Id>` enforces at compile time that each wrapper
 * supplies exactly what its template needs — change a template's props and the
 * wrapper stops typechecking.
 */
async function sendRendered<Id extends EmailTemplateId>(
  ctx: ActionCtx,
  args: {
    id: Id;
    props: EmailProps<Id>;
    to: string;
    from: string;
    replyTo?: string[];
  }
): Promise<void> {
  const { subject, html, text } = await renderEmail(args.id, args.props);
  await resend.sendEmail(ctx, {
    from: args.from,
    to: args.to,
    subject,
    html,
    text,
    replyTo: args.replyTo,
  });
}

const supportReplyTo = () => [senders.supportReplyTo];

export const sendVerification = internalAction({
  args: { to: v.string(), url: v.string(), name: v.optional(v.string()) },
  handler: (ctx, a) =>
    sendRendered(ctx, {
      id: "verification",
      props: { url: a.url, name: a.name },
      to: a.to,
      from: senders.verification,
      replyTo: supportReplyTo(),
    }),
});

export const sendWelcome = internalAction({
  args: { to: v.string(), name: v.optional(v.string()), appUrl: v.string() },
  handler: (ctx, a) =>
    sendRendered(ctx, {
      id: "welcome",
      props: { name: a.name, appUrl: a.appUrl },
      to: a.to,
      from: senders.transactional,
      replyTo: supportReplyTo(),
    }),
});

export const sendPasswordReset = internalAction({
  args: { to: v.string(), url: v.string(), name: v.optional(v.string()) },
  handler: (ctx, a) =>
    sendRendered(ctx, {
      id: "passwordReset",
      props: { url: a.url, name: a.name },
      to: a.to,
      from: senders.verification,
      replyTo: supportReplyTo(),
    }),
});

export const sendEmailChange = internalAction({
  args: {
    to: v.string(),
    newEmail: v.string(),
    url: v.string(),
    name: v.optional(v.string()),
  },
  handler: (ctx, a) =>
    sendRendered(ctx, {
      id: "emailChange",
      props: { name: a.name, newEmail: a.newEmail, url: a.url },
      to: a.to,
      from: senders.verification,
      replyTo: supportReplyTo(),
    }),
});

export const sendBillingSubscriptionStarted = internalAction({
  args: {
    to: v.string(),
    name: v.optional(v.string()),
    planName: v.string(),
    renewalDate: v.optional(v.string()),
    manageUrl: v.string(),
  },
  handler: (ctx, a) =>
    sendRendered(ctx, {
      id: "billingSubscriptionStarted",
      props: {
        name: a.name,
        planName: a.planName,
        renewalDate: a.renewalDate,
        manageUrl: a.manageUrl,
      },
      to: a.to,
      from: senders.transactional,
      replyTo: supportReplyTo(),
    }),
});

export const sendBillingSubscriptionCanceled = internalAction({
  args: {
    to: v.string(),
    name: v.optional(v.string()),
    planName: v.optional(v.string()),
    accessUntil: v.optional(v.string()),
    resubscribeUrl: v.string(),
  },
  handler: (ctx, a) =>
    sendRendered(ctx, {
      id: "billingSubscriptionCanceled",
      props: {
        name: a.name,
        planName: a.planName,
        accessUntil: a.accessUntil,
        resubscribeUrl: a.resubscribeUrl,
      },
      to: a.to,
      from: senders.transactional,
      replyTo: supportReplyTo(),
    }),
});

export const sendBillingPaymentFailed = internalAction({
  args: {
    to: v.string(),
    name: v.optional(v.string()),
    planName: v.optional(v.string()),
    updatePaymentUrl: v.string(),
  },
  handler: (ctx, a) =>
    sendRendered(ctx, {
      id: "billingPaymentFailed",
      props: {
        name: a.name,
        planName: a.planName,
        updatePaymentUrl: a.updatePaymentUrl,
      },
      to: a.to,
      from: senders.transactional,
      replyTo: supportReplyTo(),
    }),
});

export const sendWorkspaceInvitation = internalAction({
  args: {
    to: v.string(),
    inviterName: v.optional(v.string()),
    workspaceName: v.string(),
    url: v.string(),
  },
  handler: (ctx, a) =>
    sendRendered(ctx, {
      id: "workspaceInvitation",
      props: {
        inviterName: a.inviterName,
        workspaceName: a.workspaceName,
        url: a.url,
      },
      to: a.to,
      from: senders.transactional,
      replyTo: supportReplyTo(),
    }),
});
