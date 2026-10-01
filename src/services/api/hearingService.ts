import { apiRequest, isBackendConfigured, mockDelay } from "./client";
import { mockGetHearingState, mockStartHearing, mockSubmitAnswer } from "@/services/mock/mockHearing";
import type { ApiResult, BamfSessionConfig, HearingSessionState } from "@/types";

/**
 * Backend contract:
 *   GET  /api/hearing                 -> HearingSessionState
 *   POST /api/hearing/start           -> HearingSessionState
 *   POST /api/hearing/{id}/answer     -> HearingSessionState
 *
 * The backend, not the frontend, is responsible for generating questions
 * and observations via the AI orchestration layer. This service never
 * talks to the Claude API directly.
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

  async start(config: Partial<BamfSessionConfig>): Promise<ApiResult<HearingSessionState>> {
    if (isBackendConfigured) {
      const data = await apiRequest<HearingSessionState>("/api/hearing/start", {
        method: "POST",
        body: JSON.stringify(config),
      });
      return { data, isMock: false, fetchedAt: new Date().toISOString() };
    }
    await mockDelay(500);
    const data = await mockStartHearing(config);
    return { data, isMock: true, fetchedAt: new Date().toISOString() };
  },

  async submitAnswer(state: HearingSessionState, answer: string): Promise<ApiResult<HearingSessionState>> {
    if (isBackendConfigured) {
      const data = await apiRequest<HearingSessionState>(`/api/hearing/${state.sessionId}/answer`, {
        method: "POST",
        body: JSON.stringify({ answer }),
      });
      return { data, isMock: false, fetchedAt: new Date().toISOString() };
    }
    await mockDelay(500);
    const data = await mockSubmitAnswer(state, answer);
    return { data, isMock: true, fetchedAt: new Date().toISOString() };
  },
};
