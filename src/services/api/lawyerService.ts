import { apiRequest, isBackendConfigured, mockDelay } from "./client";
import { mockGenerateLawyerReview, mockGetLawyerReview, mockListLawyerReviewHistory } from "@/services/mock/mockLawyer";
import { ApiRequestError } from "@/types/common";
import type { ApiResult, LawyerReview } from "@/types";

/**
 * Backend contract:
 *   POST /api/lawyer/review?                              -> LawyerReview (generates a new version)
 *   GET /api/lawyer/review?sessionId={sessionId}          -> LawyerReview (latest version)
 *   GET /api/lawyer/review/history?sessionId={sessionId}  -> LawyerReview[] (all versions, newest first)
 *
 * Lawyer reviews are scoped to a specific hearing session (Case -> Hearing
 * Session -> Lawyer Review) — there is no global/singleton review anymore.
 * A 404 from the backend means "no review generated yet for this
 * session", which callers should treat the same as an empty result, not
 * a hard error. Generation is always an explicit user action — nothing
 * calls generate() automatically when a hearing ends.
 */
export const lawyerService = {
  async getReview(sessionId: string): Promise<ApiResult<LawyerReview | null>> {
    if (isBackendConfigured) {
      try {
        const data = await apiRequest<LawyerReview>("/api/lawyer/review", { params: { sessionId } });
        return { data, isMock: false, fetchedAt: new Date().toISOString() };
      } catch (err) {
        if (err instanceof ApiRequestError && err.status === 404) {
          return { data: null, isMock: false, fetchedAt: new Date().toISOString() };
        }
        throw err;
      }
    }
    await mockDelay();
    const data = await mockGetLawyerReview(sessionId);
    return { data, isMock: true, fetchedAt: new Date().toISOString() };
  },

  async generate(sessionId: string): Promise<ApiResult<LawyerReview>> {
    if (isBackendConfigured) {
      const data = await apiRequest<LawyerReview>("/api/lawyer/review", {
        method: "POST",
        body: JSON.stringify({ sessionId }),
      });
      return { data, isMock: false, fetchedAt: new Date().toISOString() };
    }
    await mockDelay(900); // a generation call is a real "analysis" beat, not instant
    const data = await mockGenerateLawyerReview(sessionId);
    return { data, isMock: true, fetchedAt: new Date().toISOString() };
  },

  async listHistory(sessionId: string): Promise<ApiResult<LawyerReview[]>> {
    if (isBackendConfigured) {
      const data = await apiRequest<LawyerReview[]>("/api/lawyer/review/history", { params: { sessionId } });
      return { data, isMock: false, fetchedAt: new Date().toISOString() };
    }
    await mockDelay();
    const history = await mockListLawyerReviewHistory(sessionId);
    return { data: history, isMock: true, fetchedAt: new Date().toISOString() };
  },
};
