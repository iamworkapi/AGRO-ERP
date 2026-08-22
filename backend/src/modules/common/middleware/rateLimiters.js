import rateLimit from "express-rate-limit";

// Applied to every /api/v1 route - generous enough for normal dashboard use,
// tight enough to blunt a scripted hammering of the API.
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { message: "Too many requests. Please slow down and try again shortly." } },
});

// Tighter limit on login/register specifically - these are the endpoints a
// credential-stuffing or account-enumeration script would actually hit, so
// they get their own stricter budget on top of the general one above.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { message: "Too many attempts. Please wait a few minutes before trying again." } },
});

// Requesting an OTP triggers a real email/SMS send (cost + abuse potential -
// someone could use this to spam a stranger's phone), so it gets a much
// tighter budget than ordinary auth attempts.
export const otpRequestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { message: "Too many reset codes requested. Please wait before trying again." } },
});
