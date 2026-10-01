import { type ReactNode } from "react";
import { Button } from "./Button";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** The default state for nearly every section of this app before the
 * backend is connected and real case data exists. Framed as an
 * invitation to act, not an error. */
export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center border border-dashed border-line-strong px-6 py-12 text-center">
      {icon && <div className="mb-3 text-ink-faint">{icon}</div>}
      <p className="font-display text-base font-medium text-ink">{title}</p>
      {description && <p className="mt-1.5 max-w-sm text-sm text-ink-soft">{description}</p>}
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction} className="mt-4">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
