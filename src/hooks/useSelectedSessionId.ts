import { useSearchParams } from "react-router-dom";

/**
 * The single source of truth for "which hearing session is the user
 * working with right now" (Stage 6A). Lives in the URL's `sessionId`
 * query param — not component state, not a module-level variable — so a
 * refresh, a bookmark, or a shared link all keep pointing at the same
 * session instead of silently resolving to "whatever is most recent".
 *
 * Used independently by the Mock Hearing, Lawyer Review, and Judge
 * Evaluation pages (each reads its own URL). Previous Sessions writes
 * this value when the user clicks "Open session", and any link that
 * should preserve the current session must include `?sessionId=...`
 * itself when navigating between these pages.
 */
export function useSelectedSessionId() {
  const [searchParams, setSearchParams] = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  function selectSession(id: string) {
    const next = new URLSearchParams(searchParams);
    next.set("sessionId", id);
    setSearchParams(next);
  }

  return { sessionId, selectSession };
}
