/**
 * Shared primitives used across every domain model in the app.
 * Keeping these in one place means the FastAPI backend and the
 * frontend can agree on a single vocabulary for status/severity/etc.
 */

export type IsoDateString = string; // e.g. "2026-03-14" or full ISO 8601

export type PreparationStage =
  | "not_started"
  | "gathering_information"
  | "transcript_review"
  | "mock_hearing"
  | "lawyer_review"
  | "judge_evaluation"
  | "final_preparation";

export type IssueSeverity = "critical" | "moderate" | "minor" | "informational";

export type ReliabilityRating = "high" | "medium" | "low" | "unrated";

export type AiParticipant = "bamf" | "lawyer" | "judge";

export interface CaseIssue {
  id: string;
  title: string;
  description: string;
  severity: IssueSeverity;
  category: string;
  relatedQuestionIds?: string[];
  relatedDocumentIds?: string[];
  createdAt: IsoDateString;
  resolved: boolean;
}

/**
 * Generic wrapper every service call resolves to. Mirrors what the
 * FastAPI layer is expected to return so components never need to
 * special-case mock vs. real responses.
 */
export interface ApiResult<T> {
  data: T;
  isMock: boolean;
  fetchedAt: IsoDateString;
}

export interface ApiError {
  status: number;
  message: string;
  detail?: string;
}

export class ApiRequestError extends Error {
  status: number;
  detail?: string;

  constructor(error: ApiError) {
    super(error.message);
    this.name = "ApiRequestError";
    this.status = error.status;
    this.detail = error.detail;
  }
}
