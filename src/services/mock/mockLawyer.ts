import type { LawyerReview } from "@/types/lawyer";
import { getStoredDataMode } from "./dataMode";

const EMPTY_REVIEW: LawyerReview = {
  generatedAt: null,
  caseStrengths: [],
  potentialWeaknesses: [],
  evidenceGaps: [],
  unclearFacts: [],
  issuesRequiringClarification: [],
  potentialLegalQuestions: [],
  questionsForYourRealLawyer: [],
};

const SAMPLE_REVIEW: LawyerReview = {
  generatedAt: "2026-08-29",
  caseStrengths: [
    { id: "s-1", title: "Sample strength", detail: "Placeholder text describing a strength identified in the case." },
  ],
  potentialWeaknesses: [
    { id: "w-1", title: "Sample weakness", detail: "Placeholder text describing a potential weakness." },
  ],
  evidenceGaps: [
    { id: "g-1", title: "Sample evidence gap", detail: "Placeholder text describing evidence that could strengthen the case." },
  ],
  unclearFacts: [
    { id: "u-1", title: "Sample unclear fact", detail: "Placeholder text describing a fact needing clarification." },
  ],
  issuesRequiringClarification: [
    { id: "c-1", title: "Sample issue", detail: "Placeholder text describing an issue requiring clarification." },
  ],
  potentialLegalQuestions: [
    { id: "q-1", title: "Sample legal question", detail: "Placeholder text describing a legal question worth exploring." },
  ],
  questionsForYourRealLawyer: [
    { id: "r-1", title: "Sample question for your lawyer", detail: "Placeholder text — a question to raise with your actual legal representative." },
  ],
};

export async function mockGetLawyerReview(): Promise<LawyerReview> {
  return getStoredDataMode() === "sample" ? SAMPLE_REVIEW : EMPTY_REVIEW;
}
