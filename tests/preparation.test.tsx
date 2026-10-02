import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, expect, it, vi } from 'vitest';
import { PreparationFindings } from '@/pages/PreparationFindings';
import { AnalysisSources } from '@/components/AnalysisSources';
import { LawyerReview } from '@/pages/LawyerReview';
import { DataModeProvider } from '@/context/DataModeContext';
import { preparationService } from '@/services/api/preparationService';
import { hearingService, lawyerService } from '@/services/api';
import type { PreparationState } from '@/types/preparation';
import type { HearingSessionState, LawyerReview as Review } from '@/types';

vi.mock('@/services/api/preparationService', () => ({ preparationService: { get: vi.fn() } }));
vi.mock('@/services/api', () => ({ hearingService: { getStateForSession: vi.fn() }, lawyerService: { getReview: vi.fn(), listHistory: vi.fn(), generate: vi.fn() } }));
const version = (id: string, number: number) => ({ id, version: number, generatedAt: null });
const base: PreparationState = {
  sessionId: 's1', sessionStatus: 'completed', answeredQuestionCount: 2,
  lawyerVersions: [version('l2', 2), version('l1', 1)], judgeVersions: [version('j1', 1)],
  lawyerReview: version('l2', 2), judgeEvaluation: version('j1', 1), judgeLawyerReviewId: 'l1', judgeLawyerReviewVersion: 1, judgeLawyerVersionStatus: 'different',
  findings: [
    { id: 'l2:i1', origin: 'lawyer', category: 'Evidence gaps', title: 'Evidence gap', detail: 'Find the supporting record.', basis: 'missing_information', sourceNote: null, sourceLinks: [], analysisId: 'l2', analysisVersion: 2, itemId: 'i1' },
    { id: 'j1:q1', origin: 'judge', category: 'Clarification', title: 'Clarification', detail: 'Explain the sequence.', basis: 'ai_analysis', sourceNote: null, sourceLinks: null, analysisId: 'j1', analysisVersion: 1, itemId: null },
  ],
};
function show(element: React.ReactNode, route = '/preparation?sessionId=s1') {
  return render(<MemoryRouter initialEntries={[route]}><DataModeProvider>{element}</DataModeProvider></MemoryRouter>);
}
beforeEach(() => { vi.clearAllMocks(); localStorage.clear(); });

it('requires explicit session selection without generating or retrieving analyses', () => {
  show(<PreparationFindings />, '/preparation');
  expect(screen.getByText('Select a hearing to view its findings.')).toBeTruthy();
  expect(preparationService.get).not.toHaveBeenCalled();
  expect(lawyerService.generate).not.toHaveBeenCalled();
});

it('shows version mismatch and can select the Lawyer version the Judge used', async () => {
  vi.mocked(preparationService.get).mockImplementation(async (_sid, lawyerVersion) => ({ data: lawyerVersion === 1 ? { ...base, lawyerReview: version('l1', 1), judgeLawyerVersionStatus: 'matches' } : base, isMock: false, fetchedAt: '' }));
  show(<PreparationFindings />);
  await screen.findByText('The Judge used Lawyer v1, which differs from the selected Lawyer review.');
  fireEvent.click(screen.getByRole('button', { name: 'Use Lawyer v1' }));
  await screen.findByText('The Judge used the selected Lawyer version.');
  expect(preparationService.get).toHaveBeenLastCalledWith('s1', 1, undefined);
});

it('filters findings by origin and category without changing stored analysis', async () => {
  vi.mocked(preparationService.get).mockResolvedValue({ data: base, isMock: false, fetchedAt: '' });
  show(<PreparationFindings />);
  await screen.findByText('Find the supporting record.');
  fireEvent.change(screen.getByLabelText('From'), { target: { value: 'judge' } });
  expect(screen.queryByText('Find the supporting record.')).toBeNull();
  expect(screen.getByText('Explain the sequence.')).toBeTruthy();
  fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'Evidence gaps' } });
  expect(screen.getByText('No findings match these filters.')).toBeTruthy();
  expect(lawyerService.generate).not.toHaveBeenCalled();
});

it('keeps unknown legacy lineage explicit', async () => {
  vi.mocked(preparationService.get).mockResolvedValue({ data: { ...base, judgeLawyerReviewId: null, judgeLawyerReviewVersion: null, judgeLawyerVersionStatus: 'unknown' }, isMock: false, fetchedAt: '' });
  show(<PreparationFindings />);
  await screen.findByText('The Lawyer version used by this older Judge evaluation was not recorded.');
});

it('renders the saved source chain and permits only web research URLs', () => {
  show(<AnalysisSources links={[
    { kind: 'lawyer_item', reference: 'item1', resolved: true, snapshot: { id: 'item1', title: 'Older lawyer finding', sessionId: 's1', reviewVersion: 1, sourceLinks: [{ kind: 'transcript', reference: '4', resolved: true, snapshot: { id: 'entry-old', question: 'Saved original question?', answer: 'Saved original answer.' } }] } },
    { kind: 'research', reference: 'unsafe', resolved: true, snapshot: { title: 'Research record', sourceUrl: 'javascript:alert(1)' } },
  ]} />);
  for (const summary of screen.getAllByText('Supporting records')) fireEvent.click(summary);
  expect(screen.getByText('Saved original answer.')).toBeTruthy();
  expect(screen.getByRole('link', { name: 'Open Lawyer v1 finding' }).getAttribute('href')).toBe('/hearing/lawyer?sessionId=s1&version=1#finding-item1');
  expect(screen.queryByRole('link', { name: 'Open research source' })).toBeNull();
});

const review = (number: number): Review => ({ id: `l${number}`, sessionId: 's1', version: number, generatedAt: null, caseStrengths: [], potentialWeaknesses: [], evidenceGaps: [], unclearFacts: [{ id: `item${number}`, title: `Version ${number} finding`, detail: `Only version ${number}`, sourceLinks: [] }], issuesRequiringClarification: [], potentialLegalQuestions: [], questionsForYourRealLawyer: [] });
function prepareReviewMocks() {
  vi.mocked(hearingService.getStateForSession).mockResolvedValue({ data: { sessionId: 's1', status: 'completed' } as HearingSessionState, isMock: false, fetchedAt: '' });
  vi.mocked(lawyerService.getReview).mockResolvedValue({ data: review(2), isMock: false, fetchedAt: '' });
  vi.mocked(lawyerService.listHistory).mockResolvedValue({ data: [review(2), review(1)], isMock: false, fetchedAt: '' });
}
it('opens an exact older version from a source link', async () => {
  prepareReviewMocks();
  show(<LawyerReview />, '/hearing/lawyer?sessionId=s1&version=1#finding-item1');
  await screen.findByText('Only version 1');
  expect(screen.queryByText('Only version 2')).toBeNull();
});
it('does not silently substitute the latest version for a missing version', async () => {
  prepareReviewMocks();
  show(<LawyerReview />, '/hearing/lawyer?sessionId=s1&version=99');
  await screen.findByText('The requested analysis version is not available for this session.');
  expect(screen.queryByText('Only version 2')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Show latest version' }));
  await waitFor(() => expect(screen.getByText('Only version 2')).toBeTruthy());
});
