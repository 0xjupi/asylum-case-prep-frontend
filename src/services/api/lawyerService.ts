import { apiRequest, isBackendConfigured, mockDelay } from "./client";
import { mockGetLawyerReview } from "@/services/mock/mockLawyer";
import type { ApiResult, LawyerReview } from "@/types";

/** Backend contract: GET /api/lawyer/review -> LawyerReview */
export const lawyerService = {
  async getReview(): Promise<ApiResult<LawyerReview>> {
    if (isBackendConfigured) {
      const data = await apiRequest<LawyerReview>("/api/lawyer/review");
      return { data, isMock: false, fetchedAt: new Date().toISOString() };
    }
    await mockDelay();
    const data = await mockGetLawyerReview();
    return { data, isMock: true, fetchedAt: new Date().toISOString() };
  },
};
