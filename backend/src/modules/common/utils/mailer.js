import nodemailer from "nodemailer";
import { env } from "../../../config/env.js";

let transporter = null;
if (env.smtp.host && env.smtp.user && env.smtp.pass) {
  transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: { user: env.smtp.user, pass: env.smtp.pass },
  });
}

// No SMTP configured (the common case in dev - nobody hands out real SMTP
// credentials for a demo) -> log the email instead of failing the whole
// password-reset flow. This keeps "does the OTP flow work end to end"
// testable without any external account.
export async function sendMail({ to, subject, text }) {
  if (!transporter) {
    console.log(`[mailer] SMTP not configured - would have sent to ${to}:\n  Subject: ${subject}\n  ${text}`);
    return;
  }

  await transporter.sendMail({ from: env.smtp.from, to, subject, text });
}
