import crypto from "node:crypto";

// crypto.randomInt is CSPRNG-backed (unlike Math.random) - matters here
// since this code is the entire security barrier for a password reset.
export function generateOtp(digits = 6) {
  const max = 10 ** digits;
  return String(crypto.randomInt(0, max)).padStart(digits, "0");
}
