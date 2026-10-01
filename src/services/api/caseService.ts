import { apiRequest, isBackendConfigured, mockDelay } from "./client";
import { mockGetCaseStatus, mockGetCaseSummary, mockUpdateCaseSummary } from "@/services/mock/mockCase";
import type { ApiResult, CaseStatusSnapshot, CaseSummary } from "@/types";

/**
 * Backend contract (to be implemented on FastAPI):
 *   GET   /api/case            -> CaseSummary
 *   GET   /api/case/status     -> CaseStatusSnapshot
 *   PATCH /api/case            -> CaseSummary
 */
export const caseService = {
  async getSummary(): Promise<ApiResult<CaseSummary>> {
    if (isBackendConfigured) {
      const data = await apiRequest<CaseSummary>("/api/case");
      return { data, isMock: false, fetchedAt: new Date().toISOString() };
    }
    await mockDelay();
    const data = await mockGetCaseSummary();
    return { data, isMock: true, fetchedAt: new Date().toISOString() };
  },

  async getStatus(): Promise<ApiResult<CaseStatusSnapshot>> {
    if (isBackendConfigured) {
      const data = await apiRequest<CaseStatusSnapshot>("/api/case/status");
      return { data, isMock: false, fetchedAt: new Date().toISOString() };
    }
    await mockDelay();
    const data = await mockGetCaseStatus();
    return { data, isMock: true, fetchedAt: new Date().toISOString() };
  },

  async update(partial: Partial<CaseSummary>): Promise<ApiResult<CaseSummary>> {
    if (isBackendConfigured) {
      const data = await apiRequest<CaseSummary>("/api/case", {
        method: "PATCH",
        body: JSON.stringify(partial),
      });
      return { data, isMock: false, fetchedAt: new Date().toISOString() };
    }
    await mockDelay();
    const data = await mockUpdateCaseSummary(partial);
    return { data, isMock: true, fetchedAt: new Date().toISOString() };
  },
};
