"use node";

import { internalAction } from "../_generated/server";

/**
 * @deprecated Plaintext token columns removed from schema. Run verifyEncryptedTokens instead.
 */
export const run = internalAction({
  args: {},
  handler: (): Promise<{
    scanned: number;
    migrated: number;
    skipped: number;
    deprecated: true;
  }> => {
    return Promise.resolve({
      scanned: 0,
      migrated: 0,
      skipped: 0,
      deprecated: true,
    });
  },
});
