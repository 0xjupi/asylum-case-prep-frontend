import type { JudgeEvaluation } from "@/types/judge";
import { getStoredDataMode } from "./dataMode";

const EMPTY_EVALUATION: JudgeEvaluation = {
  generatedAt: null,
  overallAssessment: null,
  factualConsistency: null,
  credibilityIssues: [],
  evidenceAssessment: null,
  countryConditionsAssessment: null,
  legalIssues: [],
  bamfArguments: [],
  lawyerArguments: [],
  questionsRequiringClarification: [],
};

const SAMPLE_EVALUATION: JudgeEvaluation = {
  generatedAt: "2026-08-30",
  overallAssessment: "Placeholder text — a neutral overall assessment will appear here.",
  factualConsistency: "Placeholder text — an assessment of factual consistency will appear here.",
  credibilityIssues: ["Placeholder credibility observation."],
  evidenceAssessment: "Placeholder text — an assessment of the evidence submitted will appear here.",
  countryConditionsAssessment: "Placeholder text — an assessment weighing country conditions will appear here.",
  legalIssues: ["Placeholder legal issue."],
  bamfArguments: [{ id: "ba-1", summary: "Placeholder argument raised by the simulated BAMF side.", source: "bamf_simulation" }],
  lawyerArguments: [{ id: "la-1", summary: "Placeholder argument raised by the simulated lawyer side.", source: "lawyer_simulation" }],
  questionsRequiringClarification: ["Placeholder question requiring clarification."],
};

export async function mockGetJudgeEvaluation(): Promise<JudgeEvaluation> {
  return getStoredDataMode() === "sample" ? SAMPLE_EVALUATION : EMPTY_EVALUATION;
}
