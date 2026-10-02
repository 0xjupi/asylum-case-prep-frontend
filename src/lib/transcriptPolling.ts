/**
 * Configurable constants for transcript-processing polling. Kept
 * separate from transcriptService so both the service and any page that
 * wants to show progress (e.g. "still processing after Xs") can read
 * the same values.
 */
export const TRANSCRIPT_POLL_INTERVAL_MS = 3_000;
export const TRANSCRIPT_POLL_TIMEOUT_MS = 5 * 60 * 1_000; // ~5 minutes
