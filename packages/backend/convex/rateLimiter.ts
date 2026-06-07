import { HOUR, MINUTE, RateLimiter } from "@convex-dev/rate-limiter";
import { components } from "./_generated/api";

const limits = {
  hybridSearch: {
    kind: "token bucket",
    rate: 30,
    period: MINUTE,
    capacity: 30,
  },
  aiResourceProcess: {
    kind: "token bucket",
    rate: 20,
    period: MINUTE,
    capacity: 20,
  },
  chatSearch: {
    kind: "token bucket",
    rate: 60,
    period: MINUTE,
    capacity: 60,
  },
  semanticTagSearch: {
    kind: "token bucket",
    rate: 30,
    period: MINUTE,
    capacity: 30,
  },
  extensionList: {
    kind: "token bucket",
    rate: 60,
    period: MINUTE,
    capacity: 60,
  },
  extensionUploadUrl: {
    kind: "token bucket",
    rate: 30,
    period: MINUTE,
    capacity: 30,
  },
  resourceUpload: {
    kind: "token bucket",
    rate: 60,
    period: MINUTE,
    capacity: 10,
  },
  startImport: {
    kind: "fixed window",
    rate: 10,
    period: HOUR,
  },
  oauthAuthorize: {
    kind: "fixed window",
    rate: 20,
    period: HOUR,
  },
  emailVerificationSend: {
    kind: "fixed window",
    rate: 5,
    period: HOUR,
  },
  emailPasswordResetSend: {
    kind: "fixed window",
    rate: 5,
    period: HOUR,
  },
  emailChangeSend: {
    kind: "fixed window",
    rate: 5,
    period: HOUR,
  },
  emailWorkspaceInviteSend: {
    kind: "fixed window",
    rate: 20,
    period: HOUR,
  },
  extensionCapture: {
    kind: "token bucket",
    rate: 30,
    period: MINUTE,
    capacity: 30,
  },
  mcpClientCall: {
    kind: "token bucket",
    rate: 60,
    period: MINUTE,
    capacity: 60,
  },
} as const;
export type RateLimitName = keyof typeof limits;
export const rateLimiter = new RateLimiter(components.rateLimiter, limits);
