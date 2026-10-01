import { FlaskConical } from "lucide-react";
import { useDataMode } from "@/context/DataModeContext";

/** Shown whenever a page is displaying mock-service data, so placeholder
 * content is never confused for real case data. Disappears automatically
 * once VITE_API_BASE_URL is set and the backend supplies real responses. */
export function DataModeBanner({ isMock }: { isMock: boolean }) {
  const { mode } = useDataMode();
  if (!isMock || mode !== "sample") return null;

  return (
    <div className="mb-5 flex items-center gap-2.5 border border-ochre/30 bg-ochre-soft px-4 py-2.5 text-sm text-ochre">
      <FlaskConical className="h-4 w-4 shrink-0" aria-hidden />
      <p>Sample data for layout preview only. Turn off preview mode in Settings to see the real, empty state.</p>
    </div>
  );
}
