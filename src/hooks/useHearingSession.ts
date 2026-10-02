import { hearingService } from "@/services/api";
import { useAsync } from "@/hooks/useAsync";

/**
 * Loads exactly the given hearing session — never "the most recent one".
 * Replaces the old useCurrentHearingSession, which silently resolved to
 * the latest session; Stage 6A requires the session to always be
 * explicit, so this hook takes the id as a parameter instead of guessing.
 *
 * Pass `null` when no session has been selected yet (e.g. no `sessionId`
 * in the URL) — the hook then skips fetching entirely, and callers
 * should render a "select a session" prompt rather than treating that as
 * a loading or error state.
 */
export function useHearingSession(sessionId: string | null) {
  const { data, isMock, loading, error, reload } = useAsync(
    () =>
      sessionId
        ? hearingService.getStateForSession(sessionId)
        : Promise.resolve({ data: null, isMock: false, fetchedAt: new Date().toISOString() }),
    [sessionId],
  );
  const belongsToSelection = isMock || data == null || data.sessionId === sessionId;

  return {
    session: belongsToSelection ? data ?? null : null,
    isMock,
    loading: loading || (!belongsToSelection && !error),
    error,
    // Distinguish "nothing selected" from "selected, but doesn't exist".
    notFound: !loading && !error && sessionId !== null && data == null,
    reload,
  };
}
