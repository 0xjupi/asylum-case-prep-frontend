import { apiRequest, isBackendConfigured, mockDelay } from "./client";
import { mockGetTranscript, mockGetTranscriptStatus, mockUploadTranscript } from "@/services/mock/mockTranscript";
import { TRANSCRIPT_POLL_INTERVAL_MS, TRANSCRIPT_POLL_TIMEOUT_MS } from "@/lib/transcriptPolling";
import { MAX_TRANSCRIPT_SIZE_BYTES, validateFile } from "@/lib/uploadConstraints";
import type { ApiResult, TranscriptDocument, TranscriptStatus } from "@/types";

/**
 * Backend contract:
 *   GET  /api/transcript          -> TranscriptDocument
 *   GET  /api/transcript/status   -> TranscriptStatus (lightweight, for polling)
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

  async getStatus(): Promise<ApiResult<TranscriptStatus>> {
    if (isBackendConfigured) {
      const data = await apiRequest<TranscriptStatus>("/api/transcript/status");
      return { data, isMock: false, fetchedAt: new Date().toISOString() };
    }
    await mockDelay(150);
    const data = await mockGetTranscriptStatus();
    return { data, isMock: true, fetchedAt: new Date().toISOString() };
  },

  async upload(file: File): Promise<ApiResult<TranscriptDocument>> {
    const validation = validateFile(file, MAX_TRANSCRIPT_SIZE_BYTES);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

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

  /**
   * Polls GET /api/transcript/status every TRANSCRIPT_POLL_INTERVAL_MS
   * until the transcript reaches "ready" or "failed", then resolves with
   * the final status. Resolves with whatever status it last saw (still
   * "processing") if TRANSCRIPT_POLL_TIMEOUT_MS elapses first — callers
   * should treat that as "still working, taking longer than expected"
   * rather than a failure.
   *
   * Pass an AbortSignal to stop polling early (e.g. if the user
   * navigates away from the transcript page).
   */
  async pollUntilSettled(options?: { signal?: AbortSignal }): Promise<ApiResult<TranscriptStatus>> {
    const startedAt = Date.now();

    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (options?.signal?.aborted) {
        throw new DOMException("Polling was aborted.", "AbortError");
      }

      const result = await transcriptService.getStatus();
      if (result.data.uploadStatus === "ready" || result.data.uploadStatus === "failed") {
        return result;
      }
      if (Date.now() - startedAt >= TRANSCRIPT_POLL_TIMEOUT_MS) {
        return result; // still "processing" — caller shows a "taking longer than expected" message
      }

      await new Promise<void>((resolve, reject) => {
        const timeoutId = setTimeout(resolve, TRANSCRIPT_POLL_INTERVAL_MS);
        options?.signal?.addEventListener(
          "abort",
          () => {
            clearTimeout(timeoutId);
            reject(new DOMException("Polling was aborted.", "AbortError"));
          },
          { once: true },
        );
      });
    }
  },
};
