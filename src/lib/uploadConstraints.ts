/**
 * Client-side mirror of the backend's upload limits (see the backend's
 * app/services/file_validation.py). This exists purely for fast,
 * friendly feedback before any bytes are sent — the backend is the
 * actual source of truth and enforces the same limits independently,
 * since client-side checks alone can always be bypassed.
 */

export const MAX_TRANSCRIPT_SIZE_MB = 50;
export const MAX_DOCUMENT_SIZE_MB = 25;

export const MAX_TRANSCRIPT_SIZE_BYTES = MAX_TRANSCRIPT_SIZE_MB * 1024 * 1024;
export const MAX_DOCUMENT_SIZE_BYTES = MAX_DOCUMENT_SIZE_MB * 1024 * 1024;

export const ALLOWED_FILE_EXTENSIONS = ["pdf", "docx", "txt", "jpg", "jpeg", "png"] as const;

export const ALLOWED_FILE_ACCEPT = ALLOWED_FILE_EXTENSIONS.map((ext) => `.${ext}`).join(",");

function extensionOf(fileName: string): string {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateFile(file: File, maxSizeBytes: number): FileValidationResult {
  const extension = extensionOf(file.name);
  if (!ALLOWED_FILE_EXTENSIONS.includes(extension as (typeof ALLOWED_FILE_EXTENSIONS)[number])) {
    return {
      valid: false,
      error: `Unsupported file type. Allowed types: ${ALLOWED_FILE_EXTENSIONS.map((e) => e.toUpperCase()).join(", ")}.`,
    };
  }
  if (file.size === 0) {
    return { valid: false, error: "This file is empty." };
  }
  if (file.size > maxSizeBytes) {
    const maxMb = maxSizeBytes / (1024 * 1024);
    return { valid: false, error: `This file is too large. The maximum allowed size is ${maxMb.toFixed(0)} MB.` };
  }
  return { valid: true };
}
