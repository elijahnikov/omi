import { internalMutation } from "./_generated/server";

/** Cron heartbeat — confirms scheduled jobs are executing. */
export const heartbeat = internalMutation({
  args: {},
  handler: () => {
    return { ok: true, at: Date.now() };
  },
});
