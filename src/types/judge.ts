import type { IsoDateString } from "./common";

export interface JudgeArgument {
  id: string;
  summary: string;
  source: "bamf_simulation" | "lawyer_simulation";
}

export interface JudgeEvaluation {
  generatedAt: IsoDateString | null;
  overallAssessment: string | null;
  factualConsistency: string | null;
  credibilityIssues: string[];
  evidenceAssessment: string | null;
  countryConditionsAssessment: string | null;
  legalIssues: string[];
  bamfArguments: JudgeArgument[];
  lawyerArguments: JudgeArgument[];
  questionsRequiringClarification: string[];
}
