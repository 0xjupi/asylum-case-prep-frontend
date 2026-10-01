import type { AiParticipant, IsoDateString } from "./common";

export interface HearingExchange {
  id: string;
  questionNumber: number;
  participant: AiParticipant;
  question: string;
  applicantAnswer: string | null;
  answeredAt: IsoDateString | null;
}

export interface HearingObservation {
  id: string;
  label: string;
  detail: string;
  relatedTranscriptQuestionNumbers: number[];
  relatedDocumentIds: string[];
}

export interface HearingSessionState {
  sessionId: string;
  activeParticipant: AiParticipant;
  currentQuestionNumber: number;
  totalQuestionsPlanned: number | null;
  exchanges: HearingExchange[];
  observations: HearingObservation[];
  status: "not_started" | "in_progress" | "paused" | "completed";
}

export interface BamfSessionConfig {
  useEntireTranscript: boolean;
  focusInconsistencies: boolean;
  focusChronology: boolean;
  focusCredibility: boolean;
  focusCountrySituation: boolean;
  focusEvidenceGaps: boolean;
  fullExamination: boolean;
}

export const DEFAULT_BAMF_SESSION_CONFIG: BamfSessionConfig = {
  useEntireTranscript: true,
  focusInconsistencies: false,
  focusChronology: false,
  focusCredibility: false,
  focusCountrySituation: false,
  focusEvidenceGaps: false,
  fullExamination: false,
};
