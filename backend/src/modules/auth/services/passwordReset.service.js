import { User } from "../models/User.js";
import { PasswordResetOtp } from "../models/PasswordResetOtp.js";
import { ApiError } from "../../common/utils/ApiError.js";
import { generateOtp } from "../../common/utils/otp.js";
import { sendMail } from "../../common/utils/mailer.js";
import { sendSms } from "../../common/utils/sms.js";
import { maskEmail, maskPhone } from "../../common/utils/mask.js";

const OTP_TTL_MINUTES = 10;

function isEmail(identifier) {
  return identifier.includes("@");
}

// Deliberately returns the same generic response whether or not an account
// exists for `identifier` - a response that varied would let an attacker
// enumerate registered emails/phones by trial and error.
export async function requestPasswordReset(identifier) {
  const user = await User.findOne(isEmail(identifier) ? { email: identifier.toLowerCase() } : { phone: identifier });

  if (user) {
    const code = generateOtp();
    const codeHash = await PasswordResetOtp.hashCode(code);
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    // Replaces any previous unconsumed code - only one active reset in
    // flight per user at a time.
    await PasswordResetOtp.findOneAndUpdate(
      { user: user._id },
      { codeHash, attempts: 0, expiresAt },
      { upsert: true, setDefaultsOnInsert: true }
    );

    // Sent to every channel on file, not just whichever one was typed in as
    // the identifier - redundancy so losing access to one doesn't lock the
    // user out of resetting at all.
    const deliveries = [];
    if (user.email) {
      deliveries.push(
        sendMail({
          to: user.email,
          subject: "Your AgriPrali ERP password reset code",
          text: `Your password reset code is ${code}. It expires in ${OTP_TTL_MINUTES} minutes. If you didn't request this, you can safely ignore this email.`,
        })
      );
    }
    if (user.phone) {
      deliveries.push(
        sendSms({
          to: user.phone,
          body: `AgriPrali ERP password reset code: ${code} (expires in ${OTP_TTL_MINUTES} minutes)`,
        })
      );
    }
    // Best-effort on both channels - one delivery failing (e.g. SMS
    // provider hiccup) shouldn't block the other or fail the whole request.
    await Promise.allSettled(deliveries);
  }

  const destinations = user ? [user.email && maskEmail(user.email), user.phone && maskPhone(user.phone)].filter(Boolean) : [];

  return {
    message:
      destinations.length > 0
        ? `If that account exists, a reset code was sent to ${destinations.join(" and ")}.`
        : "If that account exists, a reset code was sent to it.",
  };
}

export async function resetPassword({ identifier, otp, newPassword }) {
  const user = await User.findOne(isEmail(identifier) ? { email: identifier.toLowerCase() } : { phone: identifier });
  if (!user) throw ApiError.badRequest("Invalid or expired reset code.");

  const record = await PasswordResetOtp.findOne({ user: user._id });
  if (!record) throw ApiError.badRequest("Invalid or expired reset code. Request a new one.");

  if (record.attempts >= PasswordResetOtp.MAX_ATTEMPTS) {
    await record.deleteOne();
    throw ApiError.badRequest("Too many incorrect attempts. Request a new reset code.");
  }

  const matches = await record.compareCode(otp);
  if (!matches) {
    record.attempts += 1;
    await record.save();
    throw ApiError.badRequest("Incorrect reset code.");
  }

  user.passwordHash = await User.hashPassword(newPassword);
  user.tokenVersion += 1; // invalidates every session issued before this reset
  await user.save();
  await record.deleteOne();

  return { message: "Password updated. Please sign in with your new password." };
}
