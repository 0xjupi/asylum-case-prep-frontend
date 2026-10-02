import { ApiRequestError } from "@/types/common";

/** Backend AI/validation failures carry a safe, user-facing message in
 * `detail` — never a stack trace. Falls back to a generic message for
 * anything else (e.g. a network drop with no response body at all). */
export function getSafeErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiRequestError && err.detail) return err.detail;
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
