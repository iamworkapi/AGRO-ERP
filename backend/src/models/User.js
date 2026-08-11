import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { toJSONPlugin } from "./plugins/toJSON.js";
import { ALL_ROLES } from "../constants/roles.js";

// The "profiles" equivalent: one document per login. Deliberately does NOT
// store which warehouse this user belongs to - that link lives only on
// Warehouse.admin / Warehouse.supervisor (see warehouseScope.service.js), so
// it can never drift out of sync between the two collections.
const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    phone: { type: String, unique: true, sparse: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true, enum: ALL_ROLES },
    status: { type: String, required: true, enum: ["pending", "active", "inactive"], default: "pending" },
    // Small photo stored inline as a data URI, same approach as
    // Employee.avatarUrl - no external object storage required.
    avatarUrl: { type: String },
    // Bumped on password reset (and available for a future "log out of all
    // devices" action). Embedded in every issued JWT - authenticate.js
    // rejects a token whose tokenVersion doesn't match the user's current
    // one, which invalidates every previously-issued session in one write
    // instead of having to enumerate and revoke each token individually.
    tokenVersion: { type: Number, default: 0 },
  },
  { timestamps: true }
);

userSchema.set("hiddenFields", ["passwordHash"]);

userSchema.pre("validate", function requireEmailOrPhone(next) {
  if (!this.email && !this.phone) {
    next(new Error("Either email or phone is required."));
  } else {
    next();
  }
});

userSchema.statics.hashPassword = (password) => bcrypt.hash(password, 10);

userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

toJSONPlugin(userSchema);

export const User = mongoose.model("User", userSchema);
