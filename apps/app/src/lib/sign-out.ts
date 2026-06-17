const INTENTIONAL_SIGN_OUT_KEY = "omi.intentionalSignOut";

export function markIntentionalSignOut() {
  if (typeof window === "undefined") {
    return;
  }
  window.sessionStorage.setItem(INTENTIONAL_SIGN_OUT_KEY, "1");
}

export function consumeIntentionalSignOut() {
  if (typeof window === "undefined") {
    return false;
  }
  const value = window.sessionStorage.getItem(INTENTIONAL_SIGN_OUT_KEY) === "1";
  if (value) {
    window.sessionStorage.removeItem(INTENTIONAL_SIGN_OUT_KEY);
  }
  return value;
}
