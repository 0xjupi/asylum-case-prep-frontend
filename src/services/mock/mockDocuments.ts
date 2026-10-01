import type { CaseDocument } from "@/types/documents";
import { getStoredDataMode } from "./dataMode";

const SAMPLE_DOCUMENTS: CaseDocument[] = [
  {
    id: "doc-1",
    name: "Sample identity document.pdf",
    category: "identity_documents",
    fileType: "pdf",
    uploadDate: "2026-07-01",
    status: "reviewed",
    description: "Placeholder description of the document's contents.",
    source: "Applicant",
    associatedIssueIds: [],
    sizeBytes: 482_000,
  },
  {
    id: "doc-2",
    name: "Sample BAMF notice.pdf",
    category: "bamf_documents",
    fileType: "pdf",
    uploadDate: "2026-07-04",
    status: "uploaded",
    description: "Placeholder description of the document's contents.",
    source: "BAMF",
    associatedIssueIds: [],
    sizeBytes: 210_000,
  },
  {
    id: "doc-3",
    name: "Sample supporting evidence.jpg",
    category: "evidence",
    fileType: "jpg",
    uploadDate: "2026-07-10",
    status: "flagged",
    description: "Placeholder description of the document's contents.",
    source: "Applicant",
    associatedIssueIds: ["issue-1"],
    sizeBytes: 1_240_000,
  },
  {
    id: "doc-4",
    name: "Sample country report excerpt.pdf",
    category: "country_information",
    fileType: "pdf",
    uploadDate: "2026-07-18",
    status: "reviewed",
    description: "Placeholder description of the document's contents.",
    source: "Research",
    associatedIssueIds: [],
    sizeBytes: 860_000,
  },
];

export async function mockGetDocuments(): Promise<CaseDocument[]> {
  return getStoredDataMode() === "sample" ? SAMPLE_DOCUMENTS : [];
}

export async function mockUploadDocument(file: File, category: CaseDocument["category"]): Promise<CaseDocument> {
  return {
    id: `doc-${Date.now()}`,
    name: file.name,
    category,
    fileType: file.name.split(".").pop() ?? null,
    uploadDate: new Date().toISOString(),
    status: "uploaded",
    description: null,
    source: null,
    associatedIssueIds: [],
    sizeBytes: file.size,
  };
}

export async function mockDeleteDocument(_id: string): Promise<void> {
  return;
}
