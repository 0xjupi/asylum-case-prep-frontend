import type { AiParticipant, IsoDateString } from "./common";

export interface QuestionSourceSnapshot {
  id?: string;
  questionNumber?: number;
  question?: string;
  answer?: string;
  applicantAnswer?: string | null;
  page?: number | null;
  section?: string | null;
  fileName?: string | null;
  uploadedAt?: string | null;
  name?: string;
  description?: string;
}

export interface QuestionSourceReference {
  basis: string;
  referenceType: "transcript_entry" | "document" | "previous_answer" | "none";
  referenceId: string | null;
  note: string;
  resolved: boolean;
  snapshot: QuestionSourceSnapshot | null;
}

export interface HearingExchange {
  id: string;
  questionNumber: number;
  participant: AiParticipant;
  question: string;
  applicantAnswer: string | null;
  answeredAt: IsoDateString | null;
  questionType?: string | null;
  sourceReferences?: QuestionSourceReference[];
  provenanceAvailable?: boolean;
  requiresFollowUp?: boolean | null;
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
  config?: Partial<BamfSessionConfig>;
  activeParticipant: AiParticipant;
  currentQuestionNumber: number;
  totalQuestionsPlanned: number | null;
  exchanges: HearingExchange[];
  observations: HearingObservation[];
  status: "not_started" | "in_progress" | "paused" | "completed";
  /** When this session was created. Null only for the synthetic
   * "not_started" placeholder returned when no session exists yet. */
  startedAt: IsoDateString | null;
  /** Set only once the session has been explicitly completed via
   * POST /api/hearing/{id}/complete — null for every ACTIVE session. */
  completedAt: IsoDateString | null;
  questionCount: number;
  answeredQuestionCount: number;
  generationStatus?: "idle" | "generating" | "retry_required";
  generationRetryAt?: IsoDateString | null;
}

export interface BamfSessionConfig {
  questionLimit: number;
  useEntireTranscript: boolean;
  focusInconsistencies: boolean;
  focusChronology: boolean;
  focusCredibility: boolean;
  focusCountrySituation: boolean;
  focusEvidenceGaps: boolean;
  fullExamination: boolean;
}

export const DEFAULT_BAMF_SESSION_CONFIG: BamfSessionConfig = {
  questionLimit: 10,
  useEntireTranscript: true,
  focusInconsistencies: false,
  focusChronology: false,
  focusCredibility: false,
  focusCountrySituation: false,
  focusEvidenceGaps: false,
  fullExamination: false,
};
