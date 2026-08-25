const mongoUri = process.env.MONGODB_URI || "mongodb+srv://orrish2026_db_user:YDe4oIsrGQ40b7Kt@prallicluster.cikdy5a.mongodb.net/agripr_erp";
const jwtSecret = process.env.JWT_SECRET || "cee3f4b9d1662d2b2c86d047e690b4bc46277d1546f05e9ab3b1ebe9c39c473b";

export const env = {
  nodeEnv: process.env.NODE_ENV || "production",
  port: Number(process.env.PORT) || 3000,
  corsOrigin: (process.env.CORS_ORIGIN || "http://localhost:5173,http://localhost:5174").split(",").map((s) => s.trim()),
  mongoUri,
  jwt: {
    secret: jwtSecret,
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
