import { clsx } from "clsx";

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx("animate-pulse bg-paper-dim", className)} />;
}

export function SkeletonLines({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={clsx("h-3", i === lines - 1 ? "w-2/3" : "w-full")} />
      ))}
    </div>
  );
}

export function SkeletonPanel() {
  return (
    <div className="border border-line bg-surface p-6">
      <Skeleton className="mb-4 h-4 w-1/3" />
      <SkeletonLines lines={4} />
    </div>
  );
}
