const TOKEN_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const DEFAULT_LENGTH = 12;
export function generateToken(length: number = DEFAULT_LENGTH): string {
  let s = "";
  for (let i = 0; i < length; i++) {
    s += TOKEN_ALPHABET[Math.floor(Math.random() * TOKEN_ALPHABET.length)];
  }
  return s;
}
