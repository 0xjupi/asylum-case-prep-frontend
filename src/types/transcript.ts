import type { IsoDateString } from "./common";

export interface TranscriptEntry {
  id?: string | null;
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
  /** Safe, user-facing message only when uploadStatus is "failed".
   * Never contains stack traces or infrastructure detail. */
  processingError: string | null;
}

/** Lightweight shape returned by GET /api/transcript/status, used for
 * polling while a transcript is processing. Deliberately excludes
 * entries/annotations so repeated polls stay cheap. */
export interface TranscriptStatus {
  id: string;
  uploadStatus: TranscriptUploadStatus;
  processingError: string | null;
  pageCount: number | null;
  updatedAt: IsoDateString;
}
