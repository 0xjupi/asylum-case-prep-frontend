import { apiRequest, isBackendConfigured, mockDelay } from "./client";
import { mockGenerateJudgeEvaluation, mockGetJudgeEvaluation, mockListJudgeEvaluationHistory } from "@/services/mock/mockJudge";
import { ApiRequestError } from "@/types/common";
import type { ApiResult, JudgeEvaluation } from "@/types";

/**
 * Backend contract:
 *   POST /api/judge/evaluation                                -> JudgeEvaluation (generates a new version)
 *   GET /api/judge/evaluation?sessionId={sessionId}          -> JudgeEvaluation (latest version)
 *   GET /api/judge/evaluation/history?sessionId={sessionId}  -> JudgeEvaluation[] (all versions, newest first)
 *
 * Same session-scoping as lawyerService. Generation requires a lawyer
 * review to already exist for the session — the backend returns a 400
 * with a clear message if not, which callers should surface as-is.
 * Generation is always an explicit user action — nothing calls
 * generate() automatically when a lawyer review is created.
 */
export const judgeService = {
  async getEvaluation(sessionId: string): Promise<ApiResult<JudgeEvaluation | null>> {
    if (isBackendConfigured) {
      try {
        const data = await apiRequest<JudgeEvaluation>("/api/judge/evaluation", { params: { sessionId } });
        return { data, isMock: false, fetchedAt: new Date().toISOString() };
      } catch (err) {
        if (err instanceof ApiRequestError && err.status === 404) {
          return { data: null, isMock: false, fetchedAt: new Date().toISOString() };
        }
        throw err;
      }
    }
    await mockDelay();
    const data = await mockGetJudgeEvaluation(sessionId);
    return { data, isMock: true, fetchedAt: new Date().toISOString() };
  },

  async generate(sessionId: string): Promise<ApiResult<JudgeEvaluation>> {
    if (isBackendConfigured) {
      const data = await apiRequest<JudgeEvaluation>("/api/judge/evaluation", {
        method: "POST",
        body: JSON.stringify({ sessionId }),
      });
      return { data, isMock: false, fetchedAt: new Date().toISOString() };
    }
    await mockDelay(900);
    const data = await mockGenerateJudgeEvaluation(sessionId);
    return { data, isMock: true, fetchedAt: new Date().toISOString() };
  },

  async listHistory(sessionId: string): Promise<ApiResult<JudgeEvaluation[]>> {
    if (isBackendConfigured) {
      const data = await apiRequest<JudgeEvaluation[]>("/api/judge/evaluation/history", { params: { sessionId } });
      return { data, isMock: false, fetchedAt: new Date().toISOString() };
    }
    await mockDelay();
    const history = await mockListJudgeEvaluationHistory(sessionId);
    return { data: history, isMock: true, fetchedAt: new Date().toISOString() };
  },
};
