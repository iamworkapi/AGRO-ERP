import { z } from "zod";

// Mongo ObjectId: 24 hex characters. Reused wherever a validator needs to
// accept a reference to another document (adminId, warehouseId, etc.).
export const objectId = (label = "id") => z.string().regex(/^[0-9a-fA-F]{24}$/, `Invalid ${label}.`);

// Base64 data URI for a small inline photo (Employee.avatarUrl,
// User.avatarUrl) - capped well under MongoDB's document limit and
// Express's JSON body limit; ~700k chars is roughly a 500KB image after
// base64 overhead. Not a general file store, just a profile picture.
// Profile photo: accepts Data URI (base64) up to 3MB, HTTP/HTTPS URL, or empty string.
export const avatarUrl = z
  .string()
  .max(4_000_000, "Photo is too large - please use an image under 2MB.")
  .refine(
    (val) => !val || val.startsWith("http://") || val.startsWith("https://") || val.startsWith("data:image/"),
    { message: "Photo must be a valid image URL or image file upload." }
  )
  .optional()
  .or(z.literal(""))
  .or(z.null());

// ──────────────────────────────────────────────────────────────
// Indian regulatory / financial format validators
// ──────────────────────────────────────────────────────────────

/** 10-digit Indian mobile, optionally prefixed with +91 */
export const phoneRegex = /^(\+91[-\s]?)?[6-9]\d{9}$/;

/** 15-char GSTIN: 2-digit state code + PAN (10) + 1-digit entity + Z + check digit */
export const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

/** 4-8 digit HSN code (common lengths: 4, 6, or 8) */
export const hsnRegex = /^[0-9]{4,8}$/;

/** 10-char PAN: 5 letters + 4 digits + 1 letter */
export const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

/** 11-char IFSC: 4 bank code + 0 + 6-digit branch code */
export const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;

// ──────────────────────────────────────────────────────────────
// Shared field-level Zod schemas
// ──────────────────────────────────────────────────────────────

export const requiredPhoneField = z
  .string()
  .regex(phoneRegex, "Enter a valid 10-digit Indian mobile number.");

export const phoneField = z
  .string()
  .regex(phoneRegex, "Enter a valid 10-digit Indian mobile number.")
  .optional()
  .or(z.literal(""));

export const requiredGstinField = z
  .string()
  .regex(gstinRegex, "Enter a valid 15-character GSTIN (e.g. 27AAAAA0000A1Z5).");

export const gstinField = z
  .string()
  .regex(gstinRegex, "Enter a valid 15-character GSTIN (e.g. 27AAAAA0000A1Z5).")
  .optional()
  .or(z.literal(""));

export const hsnField = z
  .string()
  .regex(hsnRegex, "Enter a valid HSN code (4-8 digits).")
  .optional()
  .or(z.literal(""));

export const panField = z
  .string()
  .regex(panRegex, "Enter a valid 10-character PAN (e.g. ABCDE1234F).")
  .optional()
  .or(z.literal(""));

export const ifscField = z
  .string()
  .regex(ifscRegex, "Enter a valid 11-character IFSC code (e.g. SBIN0001234).")
  .optional()
  .or(z.literal(""));

// ──────────────────────────────────────────────────────────────
// Cross-field date range checker
// ──────────────────────────────────────────────────────────────

export function dateRangeCheck({ fromDate, toDate }) {
  if (!fromDate || !toDate) return true;
  return new Date(toDate) >= new Date(fromDate);
}
