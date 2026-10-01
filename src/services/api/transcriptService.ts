import { apiRequest, isBackendConfigured, mockDelay } from "./client";
import { mockGetTranscript, mockUploadTranscript } from "@/services/mock/mockTranscript";
import type { ApiResult, TranscriptDocument } from "@/types";

/**
 * Backend contract:
 *   GET  /api/transcript          -> TranscriptDocument
 *   POST /api/transcript/upload   -> TranscriptDocument (multipart/form-data)
 */
export const transcriptService = {
  async get(): Promise<ApiResult<TranscriptDocument>> {
    if (isBackendConfigured) {
      const data = await apiRequest<TranscriptDocument>("/api/transcript");
      return { data, isMock: false, fetchedAt: new Date().toISOString() };
    }
    await mockDelay();
    const data = await mockGetTranscript();
    return { data, isMock: true, fetchedAt: new Date().toISOString() };
  },

  async upload(file: File): Promise<ApiResult<TranscriptDocument>> {
    if (isBackendConfigured) {
      const formData = new FormData();
      formData.append("file", file);
      const data = await apiRequest<TranscriptDocument>("/api/transcript/upload", {
        method: "POST",
        body: formData,
      });
      return { data, isMock: false, fetchedAt: new Date().toISOString() };
    }
    await mockDelay(700);
    const data = await mockUploadTranscript(file);
    return { data, isMock: true, fetchedAt: new Date().toISOString() };
  },
};
