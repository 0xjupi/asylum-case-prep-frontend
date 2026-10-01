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
};

export async function mockGetHearingState(): Promise<HearingSessionState> {
  return getStoredDataMode() === "sample" ? SAMPLE_SESSION : emptySession();
}

export async function mockStartHearing(_config: Partial<BamfSessionConfig>): Promise<HearingSessionState> {
  return { ...emptySession(), status: "in_progress", currentQuestionNumber: 1 };
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
  return {
    ...state,
    exchanges: updatedExchanges,
    currentQuestionNumber: state.currentQuestionNumber + 1,
  };
}
