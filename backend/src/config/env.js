import "dotenv/config";

const required = ["MONGODB_URI", "JWT_SECRET"];

const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  throw new Error(
    `Missing required environment variable(s): ${missing.join(", ")}. Copy backend/.env.example to backend/.env and fill in your MongoDB connection string and a JWT secret.`
  );
}

// A short/weak secret makes every issued token brute-forceable offline -
// fail at boot rather than let that ship quietly. 32 chars is a reasonable
// floor for an HMAC secret (e.g. `openssl rand -hex 32` produces 64).
if (process.env.JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET is too short (needs 32+ characters). Generate one with: openssl rand -hex 32");
}
if (process.env.JWT_SECRET === "replace-with-a-long-random-string") {
  throw new Error("JWT_SECRET is still the placeholder from .env.example - generate a real secret before starting the server.");
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 4000,
  corsOrigin: (process.env.CORS_ORIGIN || "http://localhost:5173").split(",").map((s) => s.trim()),
  mongoUri: process.env.MONGODB_URI,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },
  // Optional - password reset OTPs still work without these, just logged to
  // the server console instead of actually delivered. See utils/mailer.js
  // and utils/sms.js.
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM || "AgriPrali ERP <no-reply@pralli.com>",
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    fromNumber: process.env.TWILIO_FROM_NUMBER,
  },
};
