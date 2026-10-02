import { useEffect, useState, type ReactNode, type FormEvent } from "react";
import { apiRequest, isBackendConfigured, setAccessKey } from "@/services/api/client";

export function AccessGate({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(!isBackendConfigured);
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  function lock() { setAccessKey(""); setUnlocked(false); setKey(""); }
  useEffect(() => {
    window.addEventListener("workspace-locked", lock);
    return () => window.removeEventListener("workspace-locked", lock);
  }, []);
  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError(""); setAccessKey(key);
    try { await apiRequest("/api/auth/check"); setKey(""); setUnlocked(true); }
    catch { setAccessKey(""); setError("Could not unlock. Check your access key and backend connection."); }
    finally { setBusy(false); }
  }
  if (unlocked) return <>{isBackendConfigured && <button onClick={lock} className="fixed bottom-4 right-4 z-50 rounded-lg bg-slate-900 px-4 py-2 text-white">Lock workspace</button>}{children}</>;
  return <main className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
    <form onSubmit={submit} className="w-full max-w-md rounded-xl bg-white p-8 shadow space-y-4">
      <h1 className="text-2xl font-semibold">Unlock your workspace</h1>
      <p>Your access key stays in memory for this tab. Reloading locks the workspace.</p>
      <label className="block">Access key<input autoFocus required type="password" autoComplete="off" value={key} onChange={e => setKey(e.target.value)} className="mt-2 w-full rounded border p-3" /></label>
      {error && <p role="alert">{error}</p>}
      <button disabled={busy} className="rounded bg-slate-900 px-4 py-2 text-white">{busy ? "Checking…" : "Unlock"}</button>
    </form>
  </main>;
}
