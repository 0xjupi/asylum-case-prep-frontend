import { Info } from "lucide-react";
import type { ReactNode } from "react";
import { clsx } from "clsx";

/** Required on every page that presents AI-generated output from the
 * BAMF, Lawyer, or Judge simulations, so it is never mistaken for a
 * real official, an actual attorney, or a judicial decision. */
export function SimulationNotice({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "brick" | "slate" }) {
  const toneClasses = {
    neutral: "border-line-strong bg-paper-dim text-ink-soft",
    brick: "border-brick/30 bg-brick-soft text-brick",
    slate: "border-slate/30 bg-slate-soft text-slate",
  }[tone];

  return (
    <div className={clsx("flex items-start gap-2.5 border px-4 py-3 text-sm", toneClasses)}>
      <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <p>{children}</p>
    </div>
  );
}
