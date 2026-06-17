import { query } from "../_generated/server";
import { getResolvedAuth } from "../utils";
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const auth = await getResolvedAuth(ctx);
    if (!auth) {
      return { user: null };
    }
    const user = await ctx.db.get(auth.userId);
    return { user };
  },
});
