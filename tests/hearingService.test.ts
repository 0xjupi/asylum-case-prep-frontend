import { beforeEach, describe, expect, it, vi } from 'vitest';
import { hearingService } from '@/services/api/hearingService';
import { apiRequest } from '@/services/api/client';
import { getPendingStartConfig } from '@/lib/pendingHearingStart';
import type { HearingSessionState } from '@/types';

vi.mock('@/services/api/client', () => ({ isBackendConfigured: true, apiRequest: vi.fn(), mockDelay: vi.fn() }));
const state = { sessionId: 's1', currentQuestionNumber: 1, exchanges: [{ id: 'q1', questionNumber: 1, applicantAnswer: null }] } as HearingSessionState;

beforeEach(() => { vi.clearAllMocks(); sessionStorage.clear(); });

describe('safe hearing requests', () => {
  it('binds submissions to the displayed exchange', async () => {
    vi.mocked(apiRequest).mockResolvedValue({});
    await hearingService.submitAnswer(state, 'An answer');
    expect(apiRequest).toHaveBeenCalledWith('/api/hearing/s1/answer', expect.objectContaining({ body: JSON.stringify({ exchangeId: 'q1', answer: 'An answer' }) }));
  });
  it('retries generation without sending applicant text', async () => {
    vi.mocked(apiRequest).mockResolvedValue({});
    await hearingService.retryQuestion({ ...state, exchanges: [{ ...state.exchanges[0], applicantAnswer: 'Saved private answer' }] });
    expect(apiRequest).toHaveBeenCalledWith('/api/hearing/s1/retry', expect.objectContaining({ body: JSON.stringify({ exchangeId: 'q1' }) }));
  });
  it('does not retry an unanswered question', async () => {
    await expect(hearingService.retryQuestion(state)).rejects.toThrow('Save an answer');
    expect(apiRequest).not.toHaveBeenCalled();
  });
  it('keeps a start identity and configuration across a lost response', async () => {
    vi.mocked(apiRequest).mockRejectedValueOnce(new Error('Connection dropped'));
    await expect(hearingService.start({ questionLimit: 5, focusChronology: true })).rejects.toThrow();
    const first = vi.mocked(apiRequest).mock.calls[0][1];
    expect(getPendingStartConfig()?.questionLimit).toBe(5);
    // Emulates reloading with the restored configuration.
    vi.mocked(apiRequest).mockResolvedValueOnce({ sessionId: 'created-once' });
    await hearingService.start(getPendingStartConfig()!);
    const second = vi.mocked(apiRequest).mock.calls[1][1];
    expect(second).toEqual(first);
    expect(getPendingStartConfig()).toBeNull();
  });
});
