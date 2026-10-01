import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

/**
 * Controls whether mock services return genuinely empty responses
 * ("empty") or small, clearly-labelled structural sample data
 * ("sample") so the person building the backend integration can see
 * populated layouts without any real or invented case content.
 *
 * This has no effect once a backend is configured (VITE_API_BASE_URL) —
 * real data always takes precedence.
 */
export type DataMode = "empty" | "sample";

const STORAGE_KEY = "case-prep:data-mode";

interface DataModeContextValue {
  mode: DataMode;
  setMode: (mode: DataMode) => void;
  toggle: () => void;
}

const DataModeContext = createContext<DataModeContextValue | undefined>(undefined);

export function DataModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<DataMode>(() => {
    if (typeof window === "undefined") return "empty";
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "sample" ? "sample" : "empty";
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  const value = useMemo<DataModeContextValue>(
    () => ({
      mode,
      setMode,
      toggle: () => setMode((m) => (m === "empty" ? "sample" : "empty")),
    }),
    [mode],
  );

  return <DataModeContext.Provider value={value}>{children}</DataModeContext.Provider>;
}

export function useDataMode(): DataModeContextValue {
  const ctx = useContext(DataModeContext);
  if (!ctx) throw new Error("useDataMode must be used within a DataModeProvider");
  return ctx;
}
