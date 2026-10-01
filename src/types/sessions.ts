import type { IsoDateString } from "./common";

export type SessionType =
  | "bamf_simulation"
  | "full_mock_hearing"
  | "lawyer_review"
  | "judge_evaluation";

export type SessionStatus = "completed" | "in_progress" | "abandoned";

export interface SessionSummary {
  id: string;
  date: IsoDateString;
  type: SessionType;
  questionCount: number | null;
  durationMinutes: number | null;
  status: SessionStatus;
  issuesIdentified: number;
}

export const SESSION_TYPE_LABELS: Record<SessionType, string> = {
  bamf_simulation: "BAMF simulation",
  full_mock_hearing: "Full mock hearing",
  lawyer_review: "Lawyer review",
  judge_evaluation: "Judge evaluation",
};
