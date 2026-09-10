/**
 * Phone number utilities for 10-digit Indian and standard phone validation.
 */

// Regex for strictly 10-digit mobile number (starts with 6, 7, 8, or 9 for Indian mobile, or generic 10 digits)
export const PHONE_REGEX = /^[6-9]\d{9}$/;
export const TEN_DIGIT_REGEX = /^\d{10}$/;

/**
 * Strips non-digit characters and truncates to 10 digits maximum.
 * @param {string|number} val
 * @returns {string}
 */
export function sanitizePhone(val) {
  if (val === null || val === undefined) return "";
  const str = String(val);
  // Remove all non-digit characters
  const digitsOnly = str.replace(/\D/g, "");
  // Cap at 10 digits
  return digitsOnly.slice(0, 10);
}

/**
 * Validates if the given value is exactly a valid 10-digit phone number.
 * @param {string|number} val
 * @param {boolean} strictMobile - If true, enforces starting with 6-9
 * @returns {boolean}
 */
export function isValidPhone(val, strictMobile = true) {
  if (!val) return false;
  const sanitized = sanitizePhone(val);
  if (sanitized.length !== 10) return false;
  return strictMobile ? PHONE_REGEX.test(sanitized) : TEN_DIGIT_REGEX.test(sanitized);
}

/**
 * Formats a 10-digit number into standard grouped format (e.g., "98765 43210")
 * @param {string|number} val
 * @returns {string}
 */
export function formatPhoneDisplay(val) {
  const digits = sanitizePhone(val);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)} ${digits.slice(5, 10)}`;
}
