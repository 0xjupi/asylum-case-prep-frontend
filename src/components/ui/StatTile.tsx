interface StatTileProps {
  label: string;
  value: string | number;
  hint?: string;
}

export function StatTile({ label, value, hint }: StatTileProps) {
  return (
    <div className="border border-line bg-surface p-4">
      <p className="text-sm text-ink-soft">{label}</p>
      <p className="mt-2 font-display text-2xl font-semibold text-ink">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-faint">{hint}</p>}
    </div>
  );
}
