/**
 * Centralised business-rule constants.
 *
 * Keep this file in sync with any hard-coded thresholds that appear in
 * services, controllers, or model defaults — the goal is to have a
 * single source of truth so changing a threshold never requires hunting
 * across 8+ files.
 */

export const COLLECTION = Object.freeze({
  /** Default agreed moisture % when the field is blank or zero. */
  DEFAULT_AGREED_MOISTURE_PCT: 20,

  /** Default agreed ash % when the field is blank or zero. */
  DEFAULT_AGREED_ASH_PCT: 20,

  /** Hard-rejection threshold: anything above this moisture % is rejected. */
  MAX_MOISTURE_PCT: 28,

  /** Hard-rejection threshold: anything above this ash % is rejected. */
  MAX_ASH_PCT: 35,

  /** Fallback rate per metric-tonne used when none is provided. */
  DEFAULT_RATE_PER_MT: 1400,
});

export const STOCK_ENTRY = Object.freeze({
  /** Default allowed moisture % on a new StockEntry. */
  DEFAULT_ALLOWED_MOISTURE_PCT: 20,
});
