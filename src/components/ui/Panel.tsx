import { type HTMLAttributes, type ReactNode } from "react";
import { clsx } from "clsx";

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padded?: boolean;
}

/** The app's one structural container: a hairline-bordered panel on the
 * paper background. No shadows, no gradients — borders carry the hierarchy. */
export function Panel({ children, padded = true, className, ...rest }: PanelProps) {
  return (
    <div
      className={clsx(
        "border border-line bg-surface",
        padded && "p-5 sm:p-6",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function PanelHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4 border-b border-line pb-4">
      <div>
        <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
        {description && <p className="mt-1 max-w-prose text-sm text-ink-soft">{description}</p>}
      </div>
      {action}
    </div>
  );
}
