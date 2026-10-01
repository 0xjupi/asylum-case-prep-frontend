import type { TranscriptDocument } from "@/types/transcript";
import { getStoredDataMode } from "./dataMode";

const EMPTY_TRANSCRIPT: TranscriptDocument = {
  id: "transcript-1",
  fileName: null,
  uploadStatus: "not_uploaded",
  uploadedAt: null,
  pageCount: null,
  sections: [],
  entries: [],
  annotations: [],
};

const SAMPLE_TRANSCRIPT: TranscriptDocument = {
  id: "transcript-1",
  fileName: "sample-interview-transcript.pdf",
  uploadStatus: "ready",
  uploadedAt: "2026-08-15",
  pageCount: 12,
  sections: ["Personal background", "Route of travel", "Reasons for application"],
  entries: [
    {
      questionNumber: 1,
      question: "Sample question text — placeholder for layout preview.",
      answer: "Sample answer text — placeholder for layout preview.",
      page: 1,
      section: "Personal background",
      hasAnnotation: false,
    },
    {
      questionNumber: 2,
      question: "Sample question text — placeholder for layout preview.",
      answer: "Sample answer text — placeholder for layout preview.",
      page: 2,
      section: "Route of travel",
      hasAnnotation: true,
    },
    {
      questionNumber: 3,
      question: "Sample question text — placeholder for layout preview.",
      answer: "Sample answer text — placeholder for layout preview.",
      page: 3,
      section: "Reasons for application",
      hasAnnotation: false,
    },
  ],
  annotations: [
    {
      id: "ann-1",
      questionNumber: 2,
      note: "Placeholder annotation — this is where an AI-generated observation about a passage will appear.",
      category: "chronology",
      createdAt: "2026-08-20",
    },
  ],
};

export async function mockGetTranscript(): Promise<TranscriptDocument> {
  return getStoredDataMode() === "sample" ? SAMPLE_TRANSCRIPT : EMPTY_TRANSCRIPT;
}

export async function mockUploadTranscript(file: File): Promise<TranscriptDocument> {
  return {
    ...EMPTY_TRANSCRIPT,
    fileName: file.name,
    uploadStatus: "processing",
    uploadedAt: new Date().toISOString(),
  };
}
