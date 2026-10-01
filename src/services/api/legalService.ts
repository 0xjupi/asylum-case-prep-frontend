import { apiRequest, isBackendConfigured, mockDelay } from "./client";
import { mockGetLegalSources } from "@/services/mock/mockLegal";
import type { ApiResult, LegalSource } from "@/types";

/** Backend contract: GET /api/legal/sources -> LegalSource[] */
export const legalService = {
  async listSources(): Promise<ApiResult<LegalSource[]>> {
    if (isBackendConfigured) {
      const data = await apiRequest<LegalSource[]>("/api/legal/sources");
      return { data, isMock: false, fetchedAt: new Date().toISOString() };
    }
    await mockDelay();
    const data = await mockGetLegalSources();
    return { data, isMock: true, fetchedAt: new Date().toISOString() };
  },
};
