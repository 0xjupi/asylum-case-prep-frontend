import { apiRequest, isBackendConfigured, mockDelay } from "./client";
import { mockGetJudgeEvaluation } from "@/services/mock/mockJudge";
import type { ApiResult, JudgeEvaluation } from "@/types";

/** Backend contract: GET /api/judge/evaluation -> JudgeEvaluation */
export const judgeService = {
  async getEvaluation(): Promise<ApiResult<JudgeEvaluation>> {
    if (isBackendConfigured) {
      const data = await apiRequest<JudgeEvaluation>("/api/judge/evaluation");
      return { data, isMock: false, fetchedAt: new Date().toISOString() };
    }
    await mockDelay();
    const data = await mockGetJudgeEvaluation();
    return { data, isMock: true, fetchedAt: new Date().toISOString() };
  },
};
