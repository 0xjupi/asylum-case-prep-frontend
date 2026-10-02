import type { JudgeEvaluation } from "@/types/judge";
import { getStoredDataMode } from "./dataMode";

function sampleEvaluation(sessionId: string, version = 1): JudgeEvaluation {
  return {
    id: `sample-evaluation-${version}`,
    sessionId,
    version,
    generatedAt: "2026-08-30",
    overallAssessment: "Placeholder text — a neutral overall assessment will appear here.",
    factualConsistency: "Placeholder text — an assessment of factual consistency will appear here.",
    credibilityIssues: ["Placeholder credibility observation."],
    evidenceAssessment: "Placeholder text — an assessment of the evidence submitted will appear here.",
    countryConditionsAssessment: "NOT AVAILABLE. Placeholder — country-condition verification would be required here.",
    legalIssues: ["Placeholder legal issue — legal verification required."],
    bamfArguments: [
      {
        id: "ba-1",
        summary: "Placeholder argument raised by the simulated BAMF side.",
        source: "bamf_simulation",
        basis: "uncertain",
        relatedHearingQuestionNumbers: [1],
      },
    ],
    lawyerArguments: [
      {
        id: "la-1",
        summary: "Placeholder argument raised by the simulated lawyer side.",
        source: "lawyer_simulation",
        basis: "ai_analysis",
        sourceNote: "This is the Lawyer simulation's own analysis, not an established fact.",
      },
    ],
    questionsRequiringClarification: ["Placeholder question requiring clarification."],
  };
}

// Generated evaluations accumulate here per session, mirroring the real
// backend's versioning even without one connected.
const generatedEvaluationsBySession = new Map<string, JudgeEvaluation[]>();

/** Returns null when there's no evaluation for this session yet — mirrors
 * the real backend's 404-means-nothing-yet convention. */
export async function mockGetJudgeEvaluation(sessionId: string): Promise<JudgeEvaluation | null> {
  const generated = generatedEvaluationsBySession.get(sessionId);
  if (generated && generated.length > 0) return generated[generated.length - 1];
  return getStoredDataMode() === "sample" ? sampleEvaluation(sessionId) : null;
}

export async function mockListJudgeEvaluationHistory(sessionId: string): Promise<JudgeEvaluation[]> {
  const generated = generatedEvaluationsBySession.get(sessionId);
  if (generated && generated.length > 0) return [...generated].reverse();
  return getStoredDataMode() === "sample" ? [sampleEvaluation(sessionId)] : [];
}

export async function mockGenerateJudgeEvaluation(sessionId: string): Promise<JudgeEvaluation> {
  const existing = generatedEvaluationsBySession.get(sessionId) ?? [];
  const nextVersion = existing.length + 1;
  const evaluation = sampleEvaluation(sessionId, nextVersion);
  evaluation.id = `generated-${sessionId}-v${nextVersion}`;
  evaluation.generatedAt = new Date().toISOString();
  generatedEvaluationsBySession.set(sessionId, [...existing, evaluation]);
  return evaluation;
}
