import { DEFAULT_BAMF_SESSION_CONFIG, type BamfSessionConfig } from "@/types/hearing";

const STORAGE_KEY = "pending-hearing-start";
interface PendingStart { key: string; config: BamfSessionConfig }
let memory: PendingStart | null = null;

function read(): PendingStart | null {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "null");
    if (parsed && typeof parsed.key === "string" && parsed.config) return parsed;
  } catch { /* Some browsers disable session storage. In-memory retry still works. */ }
  return memory;
}

export function getPendingStartConfig(): BamfSessionConfig | null { return read()?.config ?? null; }

export function pendingStart(config: Partial<BamfSessionConfig>): PendingStart {
  const full = { ...DEFAULT_BAMF_SESSION_CONFIG, ...config };
  const previous = read();
  if (previous && JSON.stringify(previous.config) === JSON.stringify(full)) return previous;
  memory = { key: crypto.randomUUID(), config: full };
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(memory)); } catch { /* memory fallback */ }
  return memory;
}

export function finishStart(key: string) {
  if (read()?.key !== key) return;
  memory = null;
  try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* memory fallback */ }
}
