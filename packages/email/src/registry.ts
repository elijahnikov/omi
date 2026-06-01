import type { ComponentProps } from "react";
import {
  BillingPaymentFailedEmail,
  subject as billingPaymentFailedSubject,
  renderText as billingPaymentFailedText,
} from "./templates/billing-payment-failed";
import {
  BillingSubscriptionCanceledEmail,
  subject as billingSubscriptionCanceledSubject,
  renderText as billingSubscriptionCanceledText,
} from "./templates/billing-subscription-canceled";
import {
  BillingSubscriptionStartedEmail,
  subject as billingSubscriptionStartedSubject,
  renderText as billingSubscriptionStartedText,
} from "./templates/billing-subscription-started";
import {
  EmailChangeEmail,
  subject as emailChangeSubject,
  renderText as emailChangeText,
} from "./templates/email-change";
import {
  PasswordResetEmail,
  subject as passwordResetSubject,
  renderText as passwordResetText,
} from "./templates/password-reset";
import {
  VerificationEmail,
  subject as verificationSubject,
  renderText as verificationText,
} from "./templates/verification";
import {
  WelcomeEmail,
  subject as welcomeSubject,
  renderText as welcomeText,
} from "./templates/welcome";
import {
  WorkspaceInvitationEmail,
  subject as workspaceInvitationSubject,
  renderText as workspaceInvitationText,
} from "./templates/workspace-invitation";
import type { EmailDefinition } from "./types";

/**
 * The single source of truth for every transactional email. Add a template by
 * authoring it under `templates/<name>/` and registering it here. `renderEmail`
 * and the backend send wrappers are driven entirely off this map.
 */
export const emailRegistry = {
  verification: {
    subject: verificationSubject,
    Component: VerificationEmail,
    renderText: verificationText,
  } satisfies EmailDefinition<ComponentProps<typeof VerificationEmail>>,
  welcome: {
    subject: welcomeSubject,
    Component: WelcomeEmail,
    renderText: welcomeText,
  } satisfies EmailDefinition<ComponentProps<typeof WelcomeEmail>>,
  passwordReset: {
    subject: passwordResetSubject,
    Component: PasswordResetEmail,
    renderText: passwordResetText,
  } satisfies EmailDefinition<ComponentProps<typeof PasswordResetEmail>>,
  emailChange: {
    subject: emailChangeSubject,
    Component: EmailChangeEmail,
    renderText: emailChangeText,
  } satisfies EmailDefinition<ComponentProps<typeof EmailChangeEmail>>,
  billingSubscriptionStarted: {
    subject: billingSubscriptionStartedSubject,
    Component: BillingSubscriptionStartedEmail,
    renderText: billingSubscriptionStartedText,
  } satisfies EmailDefinition<
    ComponentProps<typeof BillingSubscriptionStartedEmail>
  >,
  billingSubscriptionCanceled: {
    subject: billingSubscriptionCanceledSubject,
    Component: BillingSubscriptionCanceledEmail,
    renderText: billingSubscriptionCanceledText,
  } satisfies EmailDefinition<
    ComponentProps<typeof BillingSubscriptionCanceledEmail>
  >,
  billingPaymentFailed: {
    subject: billingPaymentFailedSubject,
    Component: BillingPaymentFailedEmail,
    renderText: billingPaymentFailedText,
  } satisfies EmailDefinition<ComponentProps<typeof BillingPaymentFailedEmail>>,
  workspaceInvitation: {
    subject: workspaceInvitationSubject,
    Component: WorkspaceInvitationEmail,
    renderText: workspaceInvitationText,
  } satisfies EmailDefinition<ComponentProps<typeof WorkspaceInvitationEmail>>,
} as const;

export type EmailTemplateId = keyof typeof emailRegistry;

export type EmailProps<Id extends EmailTemplateId> = ComponentProps<
  (typeof emailRegistry)[Id]["Component"]
>;
