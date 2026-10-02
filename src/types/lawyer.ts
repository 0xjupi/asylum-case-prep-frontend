import type { AnalysisSourceLink } from "./preparation";
import type { IsoDateString } from "./common";

export interface LawyerReviewItem {
  sourceLinks?: AnalysisSourceLink[] | null;
  id: string;
  title: string;
  detail: string;
  /** The ORIGINAL uploaded interview transcript's question numbers —
   * never the mock hearing's. These are two distinct sources. */
  relatedTranscriptQuestionNumbers?: number[];
  /** The CURRENT mock hearing session's exchange/question numbers. */
  relatedHearingQuestionNumbers?: number[];
  relatedDocumentIds?: string[];
  /** Country-information / legal-source ids this finding cites, if any. */
  relatedReferenceIds?: string[];
  /** How this finding is grounded: "fact" | "applicant_statement" |
   * "document_content" | "ai_analysis" | "uncertain" | "contradiction" |
   * "missing_information". */
  basis?: string;
  /** Set when a precise reference couldn't be established, instead of
   * inventing one. */
  sourceNote?: string | null;
}

export interface LawyerReview {
  /** Identifies this specific generated version — not the session. */
  id: string;
  /** The hearing session this review was generated for. Lawyer reviews
   * are no longer global/singleton — every review belongs to exactly
   * one session, and a session can have several versions over time. */
  sessionId: string;
  /** 1, 2, 3... — increments per session each time a new review is
   * generated. Older versions are never overwritten. */
  version: number;
  generatedAt: IsoDateString | null;
  caseStrengths: LawyerReviewItem[];
  potentialWeaknesses: LawyerReviewItem[];
  evidenceGaps: LawyerReviewItem[];
  unclearFacts: LawyerReviewItem[];
  issuesRequiringClarification: LawyerReviewItem[];
  potentialLegalQuestions: LawyerReviewItem[];
  questionsForYourRealLawyer: LawyerReviewItem[];
}
