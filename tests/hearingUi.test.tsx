import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, expect, it, vi } from 'vitest';
import { DataModeProvider } from '@/context/DataModeContext';
import { MockHearing } from '@/pages/MockHearing';
import { InterviewTranscript } from '@/pages/InterviewTranscript';
import { BamfSimulation } from '@/pages/BamfSimulation';
import { QuestionSources } from '@/components/QuestionSources';
import { hearingService, transcriptService } from '@/services/api';
import type { HearingExchange, HearingSessionState } from '@/types';

vi.mock('@/services/api', () => ({ transcriptService: { get: vi.fn() }, hearingService: { getStateForSession: vi.fn(), submitAnswer: vi.fn(), retryQuestion: vi.fn(), complete: vi.fn(), start: vi.fn() } }));
const exchange: HearingExchange = { id: 'q1', questionNumber: 1, participant: 'bamf', question: 'Practice question?', applicantAnswer: null, answeredAt: null };
const base: HearingSessionState = { sessionId: 's1', activeParticipant: 'bamf', currentQuestionNumber: 1, totalQuestionsPlanned: 10, exchanges: [exchange], observations: [], status: 'in_progress', startedAt: null, completedAt: null, questionCount: 1, answeredQuestionCount: 0, generationStatus: 'idle' };
const result = (data: HearingSessionState) => ({ data, isMock: false, fetchedAt: '2026-09-30' });
function wrapper(node: React.ReactNode, route = '/hearing?sessionId=s1') { return <MemoryRouter initialEntries={[route]}><DataModeProvider>{node}</DataModeProvider></MemoryRouter>; }
function Location() { const loc = useLocation(); return <p>Opened {loc.pathname}{loc.search}</p>; }

beforeEach(() => { vi.clearAllMocks(); localStorage.clear(); sessionStorage.clear(); });

it('shows saved-answer recovery after an AI failure and never resubmits it', async () => {
  let current = base;
  vi.mocked(hearingService.getStateForSession).mockImplementation(async () => result(current));
  vi.mocked(hearingService.submitAnswer).mockImplementation(async () => {
    current = { ...base, exchanges: [{ ...exchange, applicantAnswer: 'A preserved answer.' }], answeredQuestionCount: 1, generationStatus: 'retry_required' };
    throw new Error('AI unavailable');
  });
  vi.mocked(hearingService.retryQuestion).mockImplementation(async () => {
    current = { ...current, currentQuestionNumber: 2, questionCount: 2, generationStatus: 'idle', exchanges: [...current.exchanges, { ...exchange, id: 'q2', questionNumber: 2, question: 'Recovered next question?' }] };
    return result(current);
  });
  render(wrapper(<MockHearing />));
  fireEvent.change(await screen.findByLabelText('Your answer'), { target: { value: 'A preserved answer.' } });
  fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));
  await screen.findByText('Your answer is saved.');
  expect(screen.queryByLabelText('Your answer')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Retry next question' }));
  await screen.findByText('Recovered next question?');
  expect((screen.getByLabelText('Your answer') as HTMLTextAreaElement).value).toBe('');
  expect(hearingService.submitAnswer).toHaveBeenCalledTimes(1);
  expect(hearingService.retryQuestion).toHaveBeenCalledTimes(1);
});

it('preserves an unsaved draft when a request never reaches the backend', async () => {
  vi.mocked(hearingService.getStateForSession).mockResolvedValue(result(base));
  vi.mocked(hearingService.submitAnswer).mockRejectedValue(new Error('No connection'));
  render(wrapper(<MockHearing />));
  fireEvent.change(await screen.findByLabelText('Your answer'), { target: { value: 'Still unsaved' } });
  fireEvent.click(screen.getByRole('button', { name: 'Submit answer' }));
  await screen.findByText('No connection');
  await waitFor(() => expect((screen.getByLabelText('Your answer') as HTMLTextAreaElement).value).toBe('Still unsaved'));
});

it('opens the exact session returned by configured start', async () => {
  vi.mocked(hearingService.start).mockResolvedValue(result({ ...base, sessionId: 'configured-session' }));
  render(wrapper(<Routes><Route path='/hearing/bamf' element={<BamfSimulation />} /><Route path='/hearing' element={<Location />} /></Routes>, '/hearing/bamf'));
  fireEvent.click(screen.getByRole('button', { name: 'Start session' }));
  await screen.findByText('Opened /hearing?sessionId=configured-session');
});

it('shows saved passages and flags unmatched references', () => {
  const recorded = { ...exchange, provenanceAvailable: true, sourceReferences: [
    { basis: 'applicant_statement', referenceType: 'transcript_entry' as const, referenceId: 'old-entry', note: 'Source note', resolved: true, snapshot: { id: 'old-entry', questionNumber: 4, question: 'Original Q4?', answer: 'Original historical answer', fileName: 'old.txt', page: 3 } },
    { basis: 'uncertain', referenceType: 'document' as const, referenceId: 'invented', note: 'Unmatched note', resolved: false, snapshot: null },
  ] };
  render(wrapper(<QuestionSources exchange={recorded} />));
  fireEvent.click(screen.getByText('Question sources'));
  expect(screen.getByText('Original historical answer')).toBeTruthy();
  expect(screen.getByText('This reference could not be matched to a supplied record.')).toBeTruthy();
  expect(screen.getByRole('link', { name: 'Find in current transcript' }).getAttribute('href')).toBe('/transcript?entryId=old-entry');
});

it('distinguishes older questions with no recorded provenance', () => {
  render(wrapper(<QuestionSources exchange={exchange} />));
  expect(screen.getByText('Source references were not recorded for this older question.')).toBeTruthy();
});


it('keeps generation retries disabled while a worker is still running', async () => {
  let current: HearingSessionState = { ...base, generationStatus: 'generating', answeredQuestionCount: 1, exchanges: [{ ...exchange, applicantAnswer: 'Already saved.' }] };
  vi.mocked(hearingService.getStateForSession).mockImplementation(async () => result(current));
  render(wrapper(<MockHearing />));
  const retry = await screen.findByRole('button', { name: 'Retry next question' });
  expect((retry as HTMLButtonElement).disabled).toBe(true);
  current = { ...current, generationStatus: 'retry_required' };
  fireEvent.click(screen.getByRole('button', { name: 'Check session' }));
  await waitFor(() => expect((screen.getByRole('button', { name: 'Retry next question' }) as HTMLButtonElement).disabled).toBe(false));
});

it('does not substitute a replacement transcript passage for an older source', async () => {
  vi.mocked(transcriptService.get).mockResolvedValue({ data: { id: 'singleton', fileName: 'replacement.txt', uploadStatus: 'ready', uploadedAt: null, pageCount: 1, sections: [], entries: [{ id: 'replacement-entry', questionNumber: 1, question: 'Replacement question?', answer: 'Different answer', page: 1, section: null, hasAnnotation: false }], annotations: [], processingError: null }, isMock: false, fetchedAt: '2026-09-30' });
  render(wrapper(<InterviewTranscript />, '/transcript?entryId=old-entry'));
  await screen.findByText(/This saved passage is not in the current transcript/);
  expect(screen.getByText('Select a question from the list to view its full text and any annotations.')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: /Replacement question/ }));
  await screen.findByText('Different answer');
});
