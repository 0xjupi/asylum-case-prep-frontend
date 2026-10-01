import { Menu, FlaskConical } from "lucide-react";
import { useDataMode } from "@/context/DataModeContext";
import { clsx } from "clsx";

export function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const { mode, toggle } = useDataMode();

  return (
    <header className="flex items-center justify-between border-b border-line bg-surface px-4 py-3 sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        className="text-ink-soft hover:text-ink lg:hidden"
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden lg:block">
        <p className="text-sm text-ink-soft">
          All content here is prepared by AI simulations for practice purposes only.
        </p>
      </div>

      <button
        type="button"
        onClick={toggle}
        title="Preview mode shows sample placeholder content in empty sections. It never affects real case data."
        className={clsx(
          "flex items-center gap-1.5 border px-2.5 py-1 text-xs transition-colors",
          mode === "sample"
            ? "border-ochre/30 bg-ochre-soft text-ochre"
            : "border-line-strong text-ink-faint hover:text-ink-soft",
        )}
      >
        <FlaskConical className="h-3.5 w-3.5" aria-hidden />
        {mode === "sample" ? "Preview mode on" : "Preview mode off"}
      </button>
    </header>
  );
}
