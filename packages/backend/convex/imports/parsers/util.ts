export function hashString(s: string): string {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = (Math.imul(31, hash) + s.charCodeAt(i)) % 4_294_967_296;
  }
  const positive = hash < 0 ? hash + 4_294_967_296 : hash;
  return positive.toString(36);
}
