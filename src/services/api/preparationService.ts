import { apiRequest, isBackendConfigured } from './client';
import type { PreparationState } from '@/types/preparation';
import type { ApiResult } from '@/types';

export const preparationService = {
  async get(sessionId: string, lawyerVersion?: number, judgeVersion?: number): Promise<ApiResult<PreparationState | null>> {
    if (!isBackendConfigured) return { data: null, isMock: true, fetchedAt: new Date().toISOString() };
    const data = await apiRequest<PreparationState>('/api/preparation', { params: { sessionId, lawyerVersion, judgeVersion } });
    return { data, isMock: false, fetchedAt: new Date().toISOString() };
  },
};
