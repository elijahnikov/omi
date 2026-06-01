const TOKEN_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const DEFAULT_LENGTH = 12;

/**
 * Generate a URL-safe random base62 token. Used for public share slugs and
 * workspace invitation tokens. Collision-check at the call site against the
 * relevant index.
 */
export function generateToken(length: number = DEFAULT_LENGTH): string {
  let s = "";
  for (let i = 0; i < length; i++) {
    s += TOKEN_ALPHABET[Math.floor(Math.random() * TOKEN_ALPHABET.length)];
  }
  return s;
}
