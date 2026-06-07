import { internalMutation } from "./_generated/server";
export const heartbeat = internalMutation({
  args: {},
  handler: () => {
    return { ok: true, at: Date.now() };
  },
});
