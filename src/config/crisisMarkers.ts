/**
 * Demo/offline crisis-language markers are intentionally absent.
 * Production enforcement lives in the private.crisis_language_markers table so
 * a modified client cannot bypass it. Add only a list reviewed and supplied by
 * the Neova safety team, via a protected database migration.
 * Never infer, expand, or generate this list from example user text.
 */
export const CRISIS_LANGUAGE_MARKERS: readonly string[] = [];
