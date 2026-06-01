import type Stripe from "stripe";
import { components, internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import type { ActionCtx } from "../_generated/server";
import { type PaidPlan, planAndCadenceToPriceId } from "./pricing";

type BetterAuthCtx = ActionCtx;

interface PluginSubscription {
  billingInterval?: "day" | "week" | "month" | "year" | undefined;
  periodEnd?: Date | number | string | undefined;
  periodStart?: Date | number | string | undefined;
  plan?: string | undefined;
  priceId?: string | undefined;
  referenceId: string;
  status?: string | undefined;
  stripeCustomerId?: string | undefined;
  stripeSubscriptionId?: string | undefined;
}

function isPaidPlan(value: string): value is PaidPlan {
  return value === "basic" || value === "pro";
}

const TIER_RANK: Record<"free" | PaidPlan, number> = {
  free: 0,
  basic: 1,
  pro: 2,
};

function coerceTimestampMs(value: Date | number | string | undefined): number {
  if (value instanceof Date) {
    return value.getTime();
  }
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** Format an epoch-ms timestamp as e.g. "June 30, 2026" for email copy. */
function formatDate(ms: number): string {
  const d = new Date(ms);
  return `${MONTH_NAMES[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

const billingUrl = `${process.env.SITE_URL ?? "http://localhost:3000"}/settings?tab=billing`;

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export async function applyActiveSubscription(
  ctx: BetterAuthCtx,
  subscription: PluginSubscription,
  opts: { topUp: boolean }
): Promise<void> {
  const stripeCustomerId = subscription.stripeCustomerId;
  const stripeSubscriptionId = subscription.stripeSubscriptionId;
  if (!(stripeCustomerId && stripeSubscriptionId && subscription.plan)) {
    return;
  }
  const planName = subscription.plan;
  if (!isPaidPlan(planName)) {
    return;
  }
  const cadence: "monthly" | "yearly" =
    subscription.billingInterval === "year" ? "yearly" : "monthly";
  const priceId =
    subscription.priceId ?? planAndCadenceToPriceId(planName, cadence);
  if (!priceId) {
    return;
  }

  const appUserId = await ctx.runQuery(
    components.betterAuth.queries.getAppUserId,
    { authId: subscription.referenceId as Id<"user"> }
  );
  if (!appUserId) {
    return;
  }
  const userId = appUserId as Id<"user">;
  const currentPeriodEnd = coerceTimestampMs(subscription.periodEnd);
  const periodStart = coerceTimestampMs(subscription.periodStart);

  const before = await ctx.runQuery(internal.billing.resolver.resolveActing, {
    userId,
  });

  await ctx.runMutation(internal.billing.sync.syncSubscriptionActive, {
    userId,
    stripeCustomerId,
    stripeSubscriptionId,
    stripePriceId: priceId,
    planTier: planName,
    cadence,
    currentPeriodEnd,
    subscriptionStatus: subscription.status,
  });

  const isUpgrade = TIER_RANK[planName] > TIER_RANK[before.plan];
  if (opts.topUp || isUpgrade) {
    await ctx.runMutation(internal.billing.sync.topUpForPeriod, {
      billingAccountId: before.billingAccountId,
      planTier: planName,
      idempotencyKey: `${stripeSubscriptionId}:${periodStart}:${planName}`,
    });
  }

  // `topUp` is only set from `onSubscriptionComplete` (a brand-new checkout),
  // so this confirmation fires once on subscribe, not on every renewal/sync.
  if (opts.topUp) {
    const recipient = await ctx.runQuery(internal.email.recipients.byUserId, {
      userId,
    });
    if (recipient) {
      await ctx.scheduler.runAfter(
        0,
        internal.email.send.sendBillingSubscriptionStarted,
        {
          to: recipient.email,
          name: recipient.name,
          planName: capitalize(planName),
          renewalDate: currentPeriodEnd
            ? formatDate(currentPeriodEnd)
            : undefined,
          manageUrl: billingUrl,
        }
      );
    }
  }
}

export async function applyCanceledSubscription(
  ctx: BetterAuthCtx,
  subscription: PluginSubscription
): Promise<void> {
  if (!subscription.stripeCustomerId) {
    return;
  }
  await ctx.runMutation(internal.billing.sync.syncSubscriptionCanceled, {
    stripeCustomerId: subscription.stripeCustomerId,
  });

  const recipient = await ctx.runQuery(
    internal.email.recipients.byStripeCustomerId,
    { stripeCustomerId: subscription.stripeCustomerId }
  );
  if (recipient) {
    const periodEndMs = coerceTimestampMs(subscription.periodEnd);
    await ctx.scheduler.runAfter(
      0,
      internal.email.send.sendBillingSubscriptionCanceled,
      {
        to: recipient.email,
        name: recipient.name,
        planName:
          subscription.plan && isPaidPlan(subscription.plan)
            ? capitalize(subscription.plan)
            : undefined,
        accessUntil: periodEndMs ? formatDate(periodEndMs) : undefined,
        resubscribeUrl: billingUrl,
      }
    );
  }
}

export async function handleStripeEvent(
  ctx: BetterAuthCtx,
  event: Stripe.Event
): Promise<void> {
  if (event.type === "invoice.payment_failed") {
    await handlePaymentFailed(ctx, event);
    return;
  }
  if (event.type !== "invoice.paid") {
    return;
  }
  const invoice = event.data.object as Stripe.Invoice;
  const stripeCustomerId =
    typeof invoice.customer === "string"
      ? invoice.customer
      : invoice.customer?.id;
  if (!stripeCustomerId) {
    return;
  }
  const recurringLine = invoice.lines.data.find(
    (l) =>
      l.parent?.type === "subscription_item_details" &&
      l.parent.subscription_item_details?.proration !== true
  );
  const periodEnd = recurringLine?.period?.end;
  if (!periodEnd) {
    return;
  }
  await ctx.runMutation(internal.billing.sync.touchCurrentPeriodEnd, {
    stripeCustomerId,
    currentPeriodEnd: periodEnd * 1000,
  });
}

async function handlePaymentFailed(
  ctx: BetterAuthCtx,
  event: Stripe.Event & { type: "invoice.payment_failed" }
): Promise<void> {
  const invoice = event.data.object as Stripe.Invoice;
  const stripeCustomerId =
    typeof invoice.customer === "string"
      ? invoice.customer
      : invoice.customer?.id;
  if (!stripeCustomerId) {
    return;
  }
  const recipient = await ctx.runQuery(
    internal.email.recipients.byStripeCustomerId,
    { stripeCustomerId }
  );
  if (!recipient) {
    return;
  }
  await ctx.scheduler.runAfter(
    0,
    internal.email.send.sendBillingPaymentFailed,
    {
      to: recipient.email,
      name: recipient.name,
      updatePaymentUrl: billingUrl,
    }
  );
}
