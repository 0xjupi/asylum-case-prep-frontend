const STORAGE_KEY = "case-prep:data-mode";

/** Mirrors DataModeContext's storage so plain service functions (outside
 * React) can read the same preference without threading it through props. */
export function getStoredDataMode(): "empty" | "sample" {
  if (typeof window === "undefined") return "empty";
  return window.localStorage.getItem(STORAGE_KEY) === "sample" ? "sample" : "empty";
}
