import type { IsoDateString } from "./common";

export interface TranscriptEntry {
  questionNumber: number;
  question: string;
  answer: string;
  page: number | null;
  section: string | null;
  hasAnnotation: boolean;
}

export interface TranscriptAnnotation {
  id: string;
  questionNumber: number;
  note: string;
  category: "inconsistency" | "credibility" | "chronology" | "evidence_gap" | "general";
  createdAt: IsoDateString;
}

export type TranscriptUploadStatus = "not_uploaded" | "processing" | "ready" | "failed";

export interface TranscriptDocument {
  id: string;
  fileName: string | null;
  uploadStatus: TranscriptUploadStatus;
  uploadedAt: IsoDateString | null;
  pageCount: number | null;
  sections: string[];
  entries: TranscriptEntry[];
  annotations: TranscriptAnnotation[];
}
