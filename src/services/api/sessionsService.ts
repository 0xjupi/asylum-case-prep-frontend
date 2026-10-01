import { apiRequest, isBackendConfigured, mockDelay } from "./client";
import { mockGetSessions } from "@/services/mock/mockSessions";
import type { ApiResult, SessionSummary } from "@/types";

/** Backend contract: GET /api/sessions -> SessionSummary[] */
export const sessionsService = {
  async list(): Promise<ApiResult<SessionSummary[]>> {
    if (isBackendConfigured) {
      const data = await apiRequest<SessionSummary[]>("/api/sessions");
      return { data, isMock: false, fetchedAt: new Date().toISOString() };
    }
    await mockDelay();
    const data = await mockGetSessions();
    return { data, isMock: true, fetchedAt: new Date().toISOString() };
  },
};
