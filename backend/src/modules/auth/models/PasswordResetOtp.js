import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// One active OTP per user at a time (requesting a new one replaces the old
// one - see passwordReset.service.js). The code itself is hashed, same
// principle as passwords: a DB dump shouldn't hand over live reset codes.
const passwordResetOtpSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  codeHash: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
});

passwordResetOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const MAX_ATTEMPTS = 5;

passwordResetOtpSchema.statics.MAX_ATTEMPTS = MAX_ATTEMPTS;
passwordResetOtpSchema.statics.hashCode = (code) => bcrypt.hash(code, 8); // low cost - short-lived, rate-limited, low-entropy input anyway

passwordResetOtpSchema.methods.compareCode = function compareCode(code) {
  return bcrypt.compare(code, this.codeHash);
};

export const PasswordResetOtp = mongoose.model("PasswordResetOtp", passwordResetOtpSchema);
