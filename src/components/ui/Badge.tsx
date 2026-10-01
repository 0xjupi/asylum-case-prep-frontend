import { type ReactNode } from "react";
import { clsx } from "clsx";

export type BadgeTone = "neutral" | "accent" | "brick" | "ochre" | "slate";

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: "bg-paper-dim text-ink-soft border-line-strong",
  accent: "bg-accent-soft text-accent-dim border-accent/30",
  brick: "bg-brick-soft text-brick border-brick/25",
  ochre: "bg-ochre-soft text-ochre border-ochre/25",
  slate: "bg-slate-soft text-slate border-slate/25",
};

export function Badge({ children, tone = "neutral", className }: { children: ReactNode; tone?: BadgeTone; className?: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-xs font-medium leading-5",
        TONE_CLASSES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
