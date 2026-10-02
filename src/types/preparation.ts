import type { QuestionSourceSnapshot, QuestionSourceReference } from './hearing';

export interface AnalysisSourceSnapshot extends QuestionSourceSnapshot {
  title?: string;
  detail?: string;
  summary?: string | null;
  basis?: string | null;
  citation?: string | null;
  source?: string;
  url?: string | null;
  sourceUrl?: string | null;
  publicationDate?: string | null;
  retrievedDate?: string | null;
  effectiveDate?: string | null;
  sessionId?: string;
  reviewId?: string;
  reviewVersion?: number;
  sourceLinks?: AnalysisSourceLink[] | null;
  sourceReferences?: QuestionSourceReference[] | null;
}
export interface AnalysisSourceLink {
  kind: 'transcript' | 'hearing' | 'document' | 'research' | 'lawyer_item';
  reference: string;
  resolved: boolean;
  snapshot: AnalysisSourceSnapshot | null;
}
export interface AnalysisVersion { id: string; version: number; generatedAt: string | null }
export interface PreparationFinding {
  id: string; origin: 'lawyer' | 'judge'; category: string; title: string; detail: string;
  basis: string | null; sourceNote: string | null; sourceLinks: AnalysisSourceLink[] | null;
  analysisId: string; analysisVersion: number; itemId: string | null;
}
export interface PreparationState {
  sessionId: string; sessionStatus: string; answeredQuestionCount: number;
  lawyerVersions: AnalysisVersion[]; judgeVersions: AnalysisVersion[];
  lawyerReview: AnalysisVersion | null; judgeEvaluation: AnalysisVersion | null;
  judgeLawyerReviewId: string | null; judgeLawyerReviewVersion: number | null;
  judgeLawyerVersionStatus: 'not_available' | 'unknown' | 'matches' | 'different';
  findings: PreparationFinding[];
}
