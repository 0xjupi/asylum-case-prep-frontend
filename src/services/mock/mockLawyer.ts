import type { LawyerReview } from "@/types/lawyer";
import { getStoredDataMode } from "./dataMode";

function sampleReview(sessionId: string, version = 1): LawyerReview {
  return {
    id: `sample-review-${version}`,
    sessionId,
    version,
    generatedAt: "2026-08-29",
    caseStrengths: [
      {
        id: "s-1",
        title: "Sample strength",
        detail: "Placeholder text describing a strength identified in the case.",
        basis: "applicant_statement",
        relatedTranscriptQuestionNumbers: [1],
      },
    ],
    potentialWeaknesses: [
      { id: "w-1", title: "Sample weakness", detail: "Placeholder text describing a potential weakness.", basis: "uncertain" },
    ],
    evidenceGaps: [
      { id: "g-1", title: "Sample evidence gap", detail: "Placeholder text describing evidence that could strengthen the case.", basis: "missing_information" },
    ],
    unclearFacts: [
      { id: "u-1", title: "Sample unclear fact", detail: "Placeholder text describing a fact needing clarification.", basis: "uncertain" },
    ],
    issuesRequiringClarification: [
      {
        id: "c-1",
        title: "Sample issue",
        detail: "Placeholder text describing an issue requiring clarification.",
        basis: "contradiction",
        relatedHearingQuestionNumbers: [1],
      },
    ],
    potentialLegalQuestions: [
      {
        id: "q-1",
        title: "Legal verification required",
        detail: "Placeholder — no legal source material is available in this preview.",
        basis: "missing_information",
        sourceNote: "No legal sources are loaded in this system yet.",
      },
    ],
    questionsForYourRealLawyer: [
      { id: "r-1", title: "Sample question for your lawyer", detail: "Placeholder text — a question to raise with your actual legal representative.", basis: "ai_analysis" },
    ],
  };
}

// Generated reviews accumulate here per session, so the "Analyze with
// Lawyer" button behaves like the real backend (each click is a new
// immutable version) even without one connected.
const generatedReviewsBySession = new Map<string, LawyerReview[]>();

/** Returns null when there's no review for this session yet — mirrors
 * the real backend's 404-means-nothing-yet convention. */
export async function mockGetLawyerReview(sessionId: string): Promise<LawyerReview | null> {
  const generated = generatedReviewsBySession.get(sessionId);
  if (generated && generated.length > 0) return generated[generated.length - 1];
  return getStoredDataMode() === "sample" ? sampleReview(sessionId) : null;
}

export async function mockListLawyerReviewHistory(sessionId: string): Promise<LawyerReview[]> {
  const generated = generatedReviewsBySession.get(sessionId);
  if (generated && generated.length > 0) return [...generated].reverse();
  return getStoredDataMode() === "sample" ? [sampleReview(sessionId)] : [];
}

export async function mockGenerateLawyerReview(sessionId: string): Promise<LawyerReview> {
  const existing = generatedReviewsBySession.get(sessionId) ?? [];
  const nextVersion = existing.length + 1;
  const review = sampleReview(sessionId, nextVersion);
  review.id = `generated-${sessionId}-v${nextVersion}`;
  review.generatedAt = new Date().toISOString();
  generatedReviewsBySession.set(sessionId, [...existing, review]);
  return review;
}
