import { ApiRequestError } from "@/types/common";

/**
 * Base URL for the FastAPI backend. Unset in local/demo use, which is
 * the signal every domain service uses to fall back to its mock
 * implementation instead of calling out to a real API.
 *
 * Set VITE_API_BASE_URL in a .env file (e.g. VITE_API_BASE_URL=https://api.example.com)
 * once the backend is deployed.
 */
export const API_BASE_URL: string | undefined = import.meta.env.VITE_API_BASE_URL;

export const isBackendConfigured = Boolean(API_BASE_URL);

/** Simulates the latency of a real network call so mock-mode loading
 * states, skeletons, etc. are exercised the same way real ones will be. */
export function mockDelay(ms = 450): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface RequestOptions extends RequestInit {
  /** Query parameters to append to the URL. */
  params?: Record<string, string | number | boolean | undefined>;
}

function buildUrl(path: string, params?: RequestOptions["params"]): string {
  const url = new URL(path.replace(/^\//, ""), `${API_BASE_URL}/`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.set(key, String(value));
    });
  }
  return url.toString();
}

/**
 * Thin wrapper around fetch used by every domain service once a real
 * backend is configured. Centralizes error handling, JSON parsing, and
 * (later) auth header injection, so no component ever calls fetch
 * directly. No Anthropic or AWS credentials are ever read or sent here.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (!isBackendConfigured) {
    throw new ApiRequestError({
      status: 0,
      message: "No backend configured. Set VITE_API_BASE_URL to enable live requests.",
    });
  }

  const { params, headers, ...rest } = options;
  const url = buildUrl(path, params);
  const isFormData = typeof FormData !== "undefined" && rest.body instanceof FormData;

  let response: Response;
  try {
    response = await fetch(url, {
      ...rest,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        Accept: "application/json",
        ...headers,
      },
    });
  } catch (cause) {
    throw new ApiRequestError({
      status: 0,
      message: "Could not reach the backend.",
      detail: cause instanceof Error ? cause.message : String(cause),
    });
  }

  if (!response.ok) {
    let detail: string | undefined;
    try {
      const body = await response.json();
      detail = body?.detail ?? body?.message;
    } catch {
      // response body wasn't JSON; ignore
    }
    throw new ApiRequestError({
      status: response.status,
      message: `Request to ${path} failed with status ${response.status}`,
      detail,
    });
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
