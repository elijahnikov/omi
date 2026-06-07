import { stripe as stripePlugin } from "@better-auth/stripe";
import type { AuthFunctions, GenericCtx } from "@convex-dev/better-auth";
import { createClient } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { type BetterAuthOptions, betterAuth } from "better-auth/minimal";
import { username } from "better-auth/plugins";
import Stripe from "stripe";
import { components, internal } from "./_generated/api";
import type { DataModel, Id } from "./_generated/dataModel";
import type { ActionCtx } from "./_generated/server";
import { internalAction } from "./_generated/server";
import authConfig from "./auth.config";
import authSchema from "./betterAuth/schema";
import {
  applyActiveSubscription,
  applyCanceledSubscription,
  handleStripeEvent,
} from "./billing/hooks";
import { getPaidPlans } from "./billing/pricing";
import { rateLimiter } from "./rateLimiter";

const siteUrl = process.env.SITE_URL;
const authFunctions: AuthFunctions = internal.auth;
export const authComponent = createClient<DataModel, typeof authSchema>(
  components.betterAuth,
  {
    local: { schema: authSchema },
    authFunctions,
    triggers: {
      user: {
        async onCreate(ctx, doc) {
          const userId = await ctx.db.insert("user", {
            email: doc.email,
            username: doc.name ?? doc.email.split("@")[0] ?? "",
            emailVerified: doc.emailVerified,
            onboardedAt: undefined,
            onboardingStep: 0,
            image: undefined,
          });
          await ctx.runMutation(components.betterAuth.mutations.setUserId, {
            authId: doc._id,
            userId,
          });
          await ctx.runMutation(
            internal.billing.backfill.createPersonalAccountForUser,
            { userId }
          );
          await ctx.runMutation(internal.workspace.mutations.seedWorkspace, {
            userId,
          });
          if (doc.emailVerified) {
            await ctx.scheduler.runAfter(
              0,
              internal.email.welcome.maybeSendWelcome,
              { userId }
            );
          }
        },
      },
    },
  }
);
export const createAuthOptions = (ctx: GenericCtx<DataModel>) => {
  const origins = new Set<string>([
    siteUrl ?? "http://localhost:3000",
    "http://localhost:3000",
    "http://localhost:3001",
    "https://omi.ac",
    "https://app.omi.ac",
  ]);
  return {
    baseURL: siteUrl,
    trustedOrigins: [...origins],
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      sendResetPassword: async ({ user, url }) => {
        if (!("scheduler" in ctx)) {
          throw new Error(
            "sendResetPassword requires a mutation or action context"
          );
        }
        await rateLimiter.limit(ctx, "emailPasswordResetSend", {
          key: user.email,
          throws: true,
        });
        await ctx.scheduler.runAfter(0, internal.email.send.sendPasswordReset, {
          to: user.email,
          url,
          name: user.name,
        });
      },
    },
    user: {
      changeEmail: {
        enabled: true,
        sendChangeEmailConfirmation: async ({ user, newEmail, url }) => {
          if (!("scheduler" in ctx)) {
            throw new Error(
              "sendChangeEmailConfirmation requires a mutation or action context"
            );
          }
          await rateLimiter.limit(ctx, "emailChangeSend", {
            key: user.email,
            throws: true,
          });
          await ctx.scheduler.runAfter(0, internal.email.send.sendEmailChange, {
            to: user.email,
            newEmail,
            url,
            name: user.name,
          });
        },
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, url }) => {
        if (!("scheduler" in ctx)) {
          throw new Error(
            "sendVerificationEmail requires a mutation or action context"
          );
        }
        await rateLimiter.limit(ctx, "emailVerificationSend", {
          key: user.email,
          throws: true,
        });
        await ctx.scheduler.runAfter(0, internal.email.send.sendVerification, {
          to: user.email,
          url,
          name: user.name,
        });
      },
      afterEmailVerification: async (user) => {
        if (!("scheduler" in ctx)) {
          return;
        }
        const appUserId = await ctx.runQuery(
          components.betterAuth.queries.getAppUserId,
          { authId: user.id as Id<"user"> }
        );
        if (!appUserId) {
          return;
        }
        await ctx.scheduler.runAfter(
          0,
          internal.email.welcome.maybeSendWelcome,
          { userId: appUserId as Id<"user"> }
        );
      },
    },
    socialProviders: {
      discord: {
        clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
        clientId: process.env.DISCORD_CLIENT_ID as string,
      },
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        accessType: "offline",
        prompt: "select_account consent",
      },
    },
    plugins: [
      convex({ authConfig, jwks: process.env.JWKS }),
      username(),
      ...(process.env.STRIPE_SECRET_KEY ? [buildStripePlugin(ctx)] : []),
    ],
  } satisfies BetterAuthOptions;
};
function buildStripePlugin(ctx: GenericCtx<DataModel>) {
  const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
    apiVersion: "2026-03-25.dahlia",
  });
  const scheduleSubscriptionSync = async (referenceId: string) => {
    if (!("scheduler" in ctx)) {
      return;
    }
    const actionCtx = ctx as ActionCtx;
    const appUserId = await actionCtx.runQuery(
      components.betterAuth.queries.getAppUserId,
      { authId: referenceId as Id<"user"> }
    );
    if (!appUserId) {
      return;
    }
    const userId = appUserId as Id<"user">;
    for (const delayMs of [0, 3000, 10_000]) {
      await actionCtx.scheduler.runAfter(
        delayMs,
        internal.billing.repair.syncBillingForUser,
        { userId }
      );
    }
  };
  return stripePlugin({
    stripeClient,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
    createCustomerOnSignUp: true,
    subscription: {
      enabled: true,
      plans: () =>
        getPaidPlans().map((p) => ({
          name: p.name,
          priceId: p.monthlyPriceId,
          annualDiscountPriceId: p.yearlyPriceId,
        })),
      onSubscriptionComplete: async ({ subscription }) => {
        await applyActiveSubscription(ctx as ActionCtx, subscription, {
          topUp: true,
        });
        await scheduleSubscriptionSync(subscription.referenceId);
      },
      onSubscriptionUpdate: async ({ subscription }) => {
        await applyActiveSubscription(ctx as ActionCtx, subscription, {
          topUp: false,
        });
        await scheduleSubscriptionSync(subscription.referenceId);
      },
      onSubscriptionCancel: async ({ subscription }) => {
        await applyCanceledSubscription(ctx as ActionCtx, subscription);
      },
      onSubscriptionDeleted: async ({ subscription }) => {
        await applyCanceledSubscription(ctx as ActionCtx, subscription);
      },
    },
    onEvent: async (event) => {
      await handleStripeEvent(ctx as ActionCtx, event);
    },
  });
}
export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth(createAuthOptions(ctx));
};
export const { onCreate, onUpdate, onDelete } = authComponent.triggersApi();
export const getLatestJwks = internalAction({
  args: {},
  handler: async (ctx) => {
    const auth = createAuth(ctx);
    const jwks = await auth.api.getLatestJwks();
    return jwks;
  },
});
