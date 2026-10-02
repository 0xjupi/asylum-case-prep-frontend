import { apiRequest, isBackendConfigured, mockDelay } from "./client";
import { mockCompleteHearing, mockGetHearingState, mockStartHearing, mockSubmitAnswer } from "@/services/mock/mockHearing";
import { ApiRequestError } from "@/types/common";
import type { ApiResult, BamfSessionConfig, HearingSessionState } from "@/types";
import { pendingStart, finishStart } from "@/lib/pendingHearingStart";

/**
 * Backend contract:
 *   GET  /api/hearing                       -> HearingSessionState (most recent session, or "not_started")
 *   GET  /api/hearing?sessionId={sessionId}  -> HearingSessionState (that exact session), 404 if missing
 *   POST /api/hearing/start                  -> HearingSessionState
 *   POST /api/hearing/{id}/answer            -> HearingSessionState, 409 if the session is already completed
 *   POST /api/hearing/{id}/complete          -> HearingSessionState (ACTIVE -> COMPLETED, idempotent)
 *
 * The backend, not the frontend, is responsible for generating questions
 * and observations via the AI orchestration layer. This service never
 * talks to the Claude API directly.
 *
 * Stage 6A: session selection is now explicit everywhere. getState()
 * (no id) is a compatibility path kept for the "no session selected yet"
 * placeholder case (mirrors the backend's own no-sessionId behavior) —
 * pages should prefer getStateForSession() once a session is known.
 *
 * Stage 7A: the backend is the sole source of truth for ACTIVE vs
 * COMPLETED. This service never infers or sets that status client-side
 * — every lifecycle transition round-trips through the server.
 */
export const hearingService = {
  async getState(): Promise<ApiResult<HearingSessionState>> {
    if (isBackendConfigured) {
      const data = await apiRequest<HearingSessionState>("/api/hearing");
      return { data, isMock: false, fetchedAt: new Date().toISOString() };
    }
    await mockDelay();
    const data = await mockGetHearingState();
    return { data, isMock: true, fetchedAt: new Date().toISOString() };
  },

  /** Fetches exactly the given session — never a substitute. Resolves
   * with `data: null` (not a thrown error) when the session doesn't
   * exist, matching lawyerService/judgeService's 404-means-null
   * convention, so pages can show a clear "not found" state. */
  async getStateForSession(sessionId: string): Promise<ApiResult<HearingSessionState | null>> {
    if (isBackendConfigured) {
      try {
        const data = await apiRequest<HearingSessionState>("/api/hearing", { params: { sessionId } });
        return { data, isMock: false, fetchedAt: new Date().toISOString() };
      } catch (err) {
        if (err instanceof ApiRequestError && err.status === 404) {
          return { data: null, isMock: false, fetchedAt: new Date().toISOString() };
        }
        throw err;
      }
    }
    // Mock mode doesn't model multiple distinct sessions — it returns
    // whatever single mock session exists, ignoring the id. Good enough
    // for previewing layout without a backend connected.
    await mockDelay();
    const data = await mockGetHearingState();
    return { data, isMock: true, fetchedAt: new Date().toISOString() };
  },

  async start(config: Partial<BamfSessionConfig>): Promise<ApiResult<HearingSessionState>> {
    if (isBackendConfigured) {
      const pending = pendingStart(config);
      const data = await apiRequest<HearingSessionState>("/api/hearing/start", {
        method: "POST",
        headers: { "Idempotency-Key": pending.key },
        body: JSON.stringify(pending.config),
      });
      finishStart(pending.key);
      return { data, isMock: false, fetchedAt: new Date().toISOString() };
    }
    await mockDelay(500);
    const data = await mockStartHearing(config);
    return { data, isMock: true, fetchedAt: new Date().toISOString() };
  },

  async submitAnswer(state: HearingSessionState, answer: string): Promise<ApiResult<HearingSessionState>> {
    const exchange = state.exchanges.find(e => e.questionNumber === state.currentQuestionNumber);
    if (!exchange) throw new Error("Refresh the hearing to find the current question.");
    if (isBackendConfigured) {
      const data = await apiRequest<HearingSessionState>(`/api/hearing/${state.sessionId}/answer`, {
        method: "POST",
        body: JSON.stringify({ exchangeId: exchange.id, answer }),
      });
      return { data, isMock: false, fetchedAt: new Date().toISOString() };
    }
    await mockDelay(500);
    const data = await mockSubmitAnswer(state, answer);
    return { data, isMock: true, fetchedAt: new Date().toISOString() };
  },

  async retryQuestion(state: HearingSessionState): Promise<ApiResult<HearingSessionState>> {
    const exchange = state.exchanges.find(e => e.questionNumber === state.currentQuestionNumber);
    if (!exchange || exchange.applicantAnswer === null) throw new Error("Save an answer before retrying.");
    if (isBackendConfigured) {
      const data = await apiRequest<HearingSessionState>(`/api/hearing/${state.sessionId}/retry`, {
        method: "POST", body: JSON.stringify({ exchangeId: exchange.id }),
      });
      return { data, isMock: false, fetchedAt: new Date().toISOString() };
    }
    await mockDelay(500);
    const data = await mockSubmitAnswer(state, exchange.applicantAnswer);
    return { data, isMock: true, fetchedAt: new Date().toISOString() };
  },

  /** Explicit ACTIVE -> COMPLETED transition. Idempotent — calling this
   * again on an already-completed session just returns its current
   * state, never an error. Requires deliberate user action; never
   * called automatically. */
  async complete(sessionId: string): Promise<ApiResult<HearingSessionState>> {
    if (isBackendConfigured) {
      const data = await apiRequest<HearingSessionState>(`/api/hearing/${sessionId}/complete`, {
        method: "POST",
      });
      return { data, isMock: false, fetchedAt: new Date().toISOString() };
    }
    await mockDelay(300);
    const data = await mockCompleteHearing(sessionId);
    return { data, isMock: true, fetchedAt: new Date().toISOString() };
  },
};
