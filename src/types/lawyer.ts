import type { IsoDateString } from "./common";

export interface LawyerReviewItem {
  id: string;
  title: string;
  detail: string;
  relatedTranscriptQuestionNumbers?: number[];
  relatedDocumentIds?: string[];
}

export interface LawyerReview {
  generatedAt: IsoDateString | null;
  caseStrengths: LawyerReviewItem[];
  potentialWeaknesses: LawyerReviewItem[];
  evidenceGaps: LawyerReviewItem[];
  unclearFacts: LawyerReviewItem[];
  issuesRequiringClarification: LawyerReviewItem[];
  potentialLegalQuestions: LawyerReviewItem[];
  questionsForYourRealLawyer: LawyerReviewItem[];
}
