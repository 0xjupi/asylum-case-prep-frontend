import { apiRequest, isBackendConfigured, mockDelay } from "./client";
import { mockDeleteDocument, mockGetDocuments, mockUploadDocument } from "@/services/mock/mockDocuments";
import { MAX_DOCUMENT_SIZE_BYTES, validateFile } from "@/lib/uploadConstraints";
import type { ApiResult, CaseDocument, DocumentCategory } from "@/types";

/**
 * Backend contract:
 *   GET    /api/documents             -> CaseDocument[]
 *   POST   /api/documents/upload      -> CaseDocument (multipart/form-data, fields: file, category)
 *   DELETE /api/documents/{id}        -> 204
 */
export const documentsService = {
  async list(): Promise<ApiResult<CaseDocument[]>> {
    if (isBackendConfigured) {
      const data = await apiRequest<CaseDocument[]>("/api/documents");
      return { data, isMock: false, fetchedAt: new Date().toISOString() };
    }
    await mockDelay();
    const data = await mockGetDocuments();
    return { data, isMock: true, fetchedAt: new Date().toISOString() };
  },

  async upload(file: File, category: DocumentCategory): Promise<ApiResult<CaseDocument>> {
    const validation = validateFile(file, MAX_DOCUMENT_SIZE_BYTES);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    if (isBackendConfigured) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);
      const data = await apiRequest<CaseDocument>("/api/documents/upload", {
        method: "POST",
        body: formData,
      });
      return { data, isMock: false, fetchedAt: new Date().toISOString() };
    }
    await mockDelay(600);
    const data = await mockUploadDocument(file, category);
    return { data, isMock: true, fetchedAt: new Date().toISOString() };
  },

  async remove(id: string): Promise<ApiResult<void>> {
    if (isBackendConfigured) {
      const data = await apiRequest<void>(`/api/documents/${id}`, { method: "DELETE" });
      return { data, isMock: false, fetchedAt: new Date().toISOString() };
    }
    await mockDelay();
    const data = await mockDeleteDocument(id);
    return { data, isMock: true, fetchedAt: new Date().toISOString() };
  },
};
