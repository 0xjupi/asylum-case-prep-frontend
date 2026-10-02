import type { SessionSummary } from "@/types/sessions";
import { getStoredDataMode } from "./dataMode";

const SAMPLE_SESSIONS: SessionSummary[] = [
  {
    id: "sess-1",
    date: "2026-08-28",
    type: "bamf_simulation",
    questionCount: 14,
    durationMinutes: 38,
    status: "completed",
    issuesIdentified: 3,
    completedAt: "2026-08-28T11:20:00Z",
    lawyerReviewAvailable: true,
    lawyerReviewLatestVersion: 2,
    judgeEvaluationAvailable: true,
    judgeEvaluationLatestVersion: 1,
  },
  {
    id: "sess-2",
    date: "2026-08-20",
    type: "lawyer_review",
    questionCount: 10,
    durationMinutes: 12,
    status: "completed",
    issuesIdentified: 5,
    completedAt: "2026-08-20T09:45:00Z",
    lawyerReviewAvailable: true,
    lawyerReviewLatestVersion: 1,
    judgeEvaluationAvailable: false,
    judgeEvaluationLatestVersion: null,
  },
  {
    id: "sess-3",
    date: "2026-08-12",
    type: "full_mock_hearing",
    questionCount: 22,
    durationMinutes: 61,
    status: "abandoned",
    issuesIdentified: 1,
    completedAt: null,
    lawyerReviewAvailable: false,
    lawyerReviewLatestVersion: null,
    judgeEvaluationAvailable: false,
    judgeEvaluationLatestVersion: null,
  },
];

export async function mockGetSessions(): Promise<SessionSummary[]> {
  return getStoredDataMode() === "sample" ? SAMPLE_SESSIONS : [];
}
