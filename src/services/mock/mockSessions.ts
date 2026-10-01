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
  },
  {
    id: "sess-2",
    date: "2026-08-20",
    type: "lawyer_review",
    questionCount: null,
    durationMinutes: 12,
    status: "completed",
    issuesIdentified: 5,
  },
  {
    id: "sess-3",
    date: "2026-08-12",
    type: "full_mock_hearing",
    questionCount: 22,
    durationMinutes: 61,
    status: "abandoned",
    issuesIdentified: 1,
  },
];

export async function mockGetSessions(): Promise<SessionSummary[]> {
  return getStoredDataMode() === "sample" ? SAMPLE_SESSIONS : [];
}
