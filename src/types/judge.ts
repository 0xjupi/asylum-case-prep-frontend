import type { AnalysisSourceLink } from "./preparation";
import type { IsoDateString } from "./common";

export interface JudgeArgument {
  sourceLinks?: AnalysisSourceLink[] | null;
  id: string;
  summary: string;
  source: "bamf_simulation" | "lawyer_simulation";
  /** How this argument is grounded: "fact" | "applicant_statement" |
   * "document_content" | "ai_analysis" | "uncertain" | "contradiction" |
   * "missing_information". A lawyer_simulation argument should almost
   * never be "fact" — it's another AI's analysis, not an established fact. */
  basis?: string;
  /** The ORIGINAL uploaded interview transcript's question numbers —
   * never the mock hearing's. */
  relatedTranscriptQuestionNumbers?: number[];
  /** THIS mock hearing session's exchange/question numbers. */
  relatedHearingQuestionNumbers?: number[];
  relatedDocumentIds?: string[];
  /** Country-information / legal-source ids this argument cites, if any. */
  relatedReferenceIds?: string[];
  /** LawyerReviewItem ids this argument draws from, if any. */
  relatedLawyerItemIds?: string[];
  /** Set when a precise reference couldn't be established, instead of
   * inventing one. */
  sourceNote?: string | null;
}

export interface JudgeEvaluation {
  lawyerReviewId?: string | null;
  lawyerReviewVersion?: number | null;
  /** Identifies this specific generated version — not the session. */
  id: string;
  /** The hearing session this evaluation was generated for — no longer
   * global/singleton, matching LawyerReview's session scoping. */
  sessionId: string;
  /** 1, 2, 3... — increments per session each time a new evaluation is
   * generated. Older versions are never overwritten. */
  version: number;
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
