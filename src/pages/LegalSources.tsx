import { useState } from "react";
import { BookMarked, ExternalLink } from "lucide-react";
import { legalService } from "@/services/api";
import { useAsync } from "@/hooks/useAsync";
import { Panel, DataModeBanner, EmptyState, Badge } from "@/components/ui";
import { SkeletonPanel } from "@/components/ui/Skeleton";
import { formatDate } from "@/lib/labels";
import { LEGAL_SOURCE_CATEGORY_LABELS } from "@/types";
import type { LegalSourceCategory } from "@/types";
import { clsx } from "clsx";

const CATEGORIES = Object.keys(LEGAL_SOURCE_CATEGORY_LABELS) as LegalSourceCategory[];

export function LegalSources() {
  const { data, isMock, loading, error } = useAsync(() => legalService.listSources(), []);
  const [activeCategory, setActiveCategory] = useState<LegalSourceCategory | "all">("all");

  const filtered = (data ?? []).filter((item) => activeCategory === "all" || item.category === activeCategory);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <BookMarked className="h-5 w-5 text-accent" />
          <h1 className="font-display text-2xl font-semibold text-ink">Legal sources</h1>
        </div>
        <p className="mt-1 text-sm text-ink-soft">
          A reference library of statutes, case law, and guidance. This section presents sources only — it
          does not offer legal analysis or conclusions.
        </p>
      </div>

      <DataModeBanner isMock={isMock} />

      <div className="flex flex-wrap gap-1.5">
        <CategoryChip label="All sources" active={activeCategory === "all"} onClick={() => setActiveCategory("all")} />
        {CATEGORIES.map((cat) => (
          <CategoryChip key={cat} label={LEGAL_SOURCE_CATEGORY_LABELS[cat]} active={activeCategory === cat} onClick={() => setActiveCategory(cat)} />
        ))}
      </div>

      {loading ? (
        <SkeletonPanel />
      ) : error ? (
        <Panel><p className="text-sm text-brick">{error}</p></Panel>
      ) : filtered.length === 0 ? (
        <Panel>
          <EmptyState
            title="No legal sources added yet."
            description="Statutes, case law, and BAMF guidance will appear here, each with its citation and a link back to the original source."
          />
        </Panel>
      ) : (
        <div className="space-y-4">
          {filtered.map((source) => (
            <Panel key={source.id}>
              <Badge tone="neutral">{LEGAL_SOURCE_CATEGORY_LABELS[source.category]}</Badge>
              <h3 className="mt-2 font-display text-base font-semibold text-ink">{source.title}</h3>
              {source.summary && <p className="mt-2 text-sm text-ink-soft">{source.summary}</p>}
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line pt-3 text-xs text-ink-faint">
                {source.courtOrAuthority && <span>{source.courtOrAuthority}</span>}
                {source.date && <span>{formatDate(source.date)}</span>}
                {source.citation && <span className="font-mono">{source.citation}</span>}
                {source.relevantSection && <span>Section: {source.relevantSection}</span>}
                {source.sourceUrl && (
                  <a href={source.sourceUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-accent hover:underline">
                    View source <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "border px-2.5 py-1 text-xs transition-colors",
        active ? "border-accent bg-accent-soft text-accent-dim" : "border-line-strong text-ink-soft hover:text-ink",
      )}
    >
      {label}
    </button>
  );
}
