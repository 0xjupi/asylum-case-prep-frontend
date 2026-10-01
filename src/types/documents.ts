import type { IsoDateString } from "./common";

export type DocumentCategory =
  | "bamf_documents"
  | "court_documents"
  | "identity_documents"
  | "evidence"
  | "country_information"
  | "other";

export type DocumentStatus = "uploaded" | "processing" | "reviewed" | "flagged" | "archived";

export interface CaseDocument {
  id: string;
  name: string;
  category: DocumentCategory;
  fileType: string | null;
  uploadDate: IsoDateString;
  status: DocumentStatus;
  description: string | null;
  source: string | null;
  associatedIssueIds: string[];
  sizeBytes: number | null;
}

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  bamf_documents: "BAMF documents",
  court_documents: "Court documents",
  identity_documents: "Identity documents",
  evidence: "Evidence",
  country_information: "Country information",
  other: "Other",
};
