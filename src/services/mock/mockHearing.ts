import type { BamfSessionConfig, HearingSessionState } from "@/types/hearing";
import { getStoredDataMode } from "./dataMode";

function emptySession(): HearingSessionState {
  return {
    sessionId: `session-${Date.now()}`,
    activeParticipant: "bamf",
    currentQuestionNumber: 0,
    totalQuestionsPlanned: null,
    exchanges: [],
    observations: [],
    status: "not_started",
    startedAt: null,
    completedAt: null,
    questionCount: 0,
    answeredQuestionCount: 0,
  };
}

const SAMPLE_SESSION: HearingSessionState = {
  sessionId: "sample-session-1",
  activeParticipant: "bamf",
  currentQuestionNumber: 3,
  totalQuestionsPlanned: 12,
  exchanges: [
    {
      id: "ex-1",
      questionNumber: 1,
      participant: "bamf",
      question: "Sample question text — placeholder for layout preview.",
      applicantAnswer: "Sample applicant answer — placeholder for layout preview.",
      answeredAt: "2026-08-28T10:00:00Z",
    },
    {
      id: "ex-2",
      questionNumber: 2,
      participant: "bamf",
      question: "Sample follow-up question — placeholder for layout preview.",
      applicantAnswer: "Sample applicant answer — placeholder for layout preview.",
      answeredAt: "2026-08-28T10:02:00Z",
    },
    {
      id: "ex-3",
      questionNumber: 3,
      participant: "bamf",
      question: "Sample question currently awaiting an answer.",
      applicantAnswer: null,
      answeredAt: null,
    },
  ],
  observations: [
    {
      id: "obs-1",
      label: "Sample observation",
      detail: "Placeholder text for a concise, backend-generated observation shown to the applicant.",
      relatedTranscriptQuestionNumbers: [2],
      relatedDocumentIds: [],
    },
  ],
  status: "in_progress",
  startedAt: "2026-08-28T09:55:00Z",
  completedAt: null,
  questionCount: 3,
  answeredQuestionCount: 2,
};

// Mock mode doesn't model multiple distinct backend-persisted sessions —
// this tracks just the one "current" demo session in memory, so
// start -> answer -> complete behaves sensibly within a single preview
// session without a backend connected.
let currentSession: HearingSessionState | null = null;

function withCounts(state: HearingSessionState): HearingSessionState {
  return {
    ...state,
    questionCount: state.exchanges.length,
    answeredQuestionCount: state.exchanges.filter((e) => e.applicantAnswer !== null).length,
  };
}

export async function mockGetHearingState(): Promise<HearingSessionState> {
  if (currentSession) return currentSession;
  return getStoredDataMode() === "sample" ? SAMPLE_SESSION : emptySession();
}

export async function mockStartHearing(config: Partial<BamfSessionConfig>): Promise<HearingSessionState> {
  const now = new Date().toISOString();
  currentSession = withCounts({
    ...emptySession(),
    status: "in_progress",
    config,
    totalQuestionsPlanned: config.questionLimit ?? 10,
    currentQuestionNumber: 1,
    startedAt: now,
    exchanges: [
      {
        id: "mock-exchange-1",
        questionNumber: 1,
        participant: "bamf",
        question: "Sample first question — placeholder for layout preview.",
        applicantAnswer: null,
        answeredAt: null,
      },
    ],
  });
  return currentSession;
}

export async function mockSubmitAnswer(
  state: HearingSessionState,
  answer: string,
): Promise<HearingSessionState> {
  const updatedExchanges = state.exchanges.map((exchange) =>
    exchange.questionNumber === state.currentQuestionNumber
      ? { ...exchange, applicantAnswer: answer, answeredAt: new Date().toISOString() }
      : exchange,
  );
  const done = state.totalQuestionsPlanned !== null && state.currentQuestionNumber >= state.totalQuestionsPlanned;
  const nextNumber = state.currentQuestionNumber + 1;
  currentSession = withCounts({
    ...state,
    exchanges: done ? updatedExchanges : [...updatedExchanges, {
      id: `mock-exchange-${nextNumber}`, questionNumber: nextNumber, participant: "bamf",
      question: "Sample follow-up question — placeholder for layout preview.", applicantAnswer: null, answeredAt: null,
    }],
    currentQuestionNumber: done ? state.currentQuestionNumber : nextNumber,
    status: done ? "completed" : "in_progress",
    completedAt: done ? new Date().toISOString() : null,
  });
  return currentSession;
}

export async function mockCompleteHearing(_sessionId: string): Promise<HearingSessionState> {
  const base = currentSession ?? (await mockGetHearingState());
  currentSession = withCounts({
    ...base,
    status: "completed",
    completedAt: base.completedAt ?? new Date().toISOString(), // idempotent, like the real backend
  });
  return currentSession;
}
