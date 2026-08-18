import mongoose from "mongoose";

// Tracks login attempts per identifier (email or phone) to enforce
// per-account lockout after repeated failures. Records older than
// LOCKOUT_WINDOW_MINUTES auto-delete via the TTL index so the
// collection can never grow unbounded.
const loginAttemptSchema = new mongoose.Schema(
  {
    identifier: { type: String, required: true, index: true, trim: true },
    ip: { type: String, required: true },
    success: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

// Auto-delete records after 15 minutes so the collection stays bounded.
loginAttemptSchema.index({ createdAt: 1 }, { expireAfterSeconds: 900 });

// Compound index for fast lockout lookups.
loginAttemptSchema.index({ identifier: 1, success: 1, createdAt: 1 });

export const LoginAttempt = mongoose.model("LoginAttempt", loginAttemptSchema);
