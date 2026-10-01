import { useState } from "react";
import { Globe2, ExternalLink } from "lucide-react";
import { countryService } from "@/services/api";
import { useAsync } from "@/hooks/useAsync";
import { Panel, PanelHeader, DataModeBanner, EmptyState, Badge } from "@/components/ui";
import type { BadgeTone } from "@/components/ui";
import { SkeletonPanel } from "@/components/ui/Skeleton";
import { formatDate } from "@/lib/labels";
import { COUNTRY_INFO_CATEGORY_LABELS } from "@/types";
import type { CountryInfoCategory, ReliabilityRating } from "@/types";
import { clsx } from "clsx";

const CATEGORIES = Object.keys(COUNTRY_INFO_CATEGORY_LABELS) as CountryInfoCategory[];

const RELIABILITY_TONE: Record<ReliabilityRating, BadgeTone> = {
  high: "accent",
  medium: "ochre",
  low: "brick",
  unrated: "neutral",
};

export function CountryInformation() {
  const { data, isMock, loading, error } = useAsync(() => countryService.getProfile(), []);
  const [activeCategory, setActiveCategory] = useState<CountryInfoCategory | "all">("all");

  const filtered = (data?.items ?? []).filter((item) => activeCategory === "all" || item.category === activeCategory);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Globe2 className="h-5 w-5 text-accent" />
          <h1 className="font-display text-2xl font-semibold text-ink">Country information{data ? `: ${data.countryName}` : ""}</h1>
        </div>
        <p className="mt-1 text-sm text-ink-soft">
          Sourced, dated reference material on conditions in your country of origin. Every item will show
          where it came from and when it was retrieved.
        </p>
      </div>

      <DataModeBanner isMock={isMock} />

      <div className="flex flex-wrap gap-1.5">
        <CategoryChip label="All categories" active={activeCategory === "all"} onClick={() => setActiveCategory("all")} />
        {CATEGORIES.map((cat) => (
          <CategoryChip key={cat} label={COUNTRY_INFO_CATEGORY_LABELS[cat]} active={activeCategory === cat} onClick={() => setActiveCategory(cat)} />
        ))}
      </div>

      {loading ? (
        <SkeletonPanel />
      ) : error ? (
        <Panel><p className="text-sm text-brick">{error}</p></Panel>
      ) : filtered.length === 0 ? (
        <Panel>
          <EmptyState
            title="No country information added yet."
            description="This section will be populated with sourced, dated reporting on current conditions once that stage is implemented."
          />
        </Panel>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => (
            <Panel key={item.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Badge tone="neutral">{COUNTRY_INFO_CATEGORY_LABELS[item.category]}</Badge>
                  <h3 className="mt-2 font-display text-base font-semibold text-ink">{item.title}</h3>
                </div>
                <Badge tone={RELIABILITY_TONE[item.reliability]}>{item.reliability} reliability</Badge>
              </div>
              <p className="mt-2 text-sm text-ink-soft">{item.summary}</p>
              {item.excerpt && (
                <blockquote className="mt-3 border-l-2 border-line-strong pl-3 text-sm italic text-ink-soft">
                  {item.excerpt}
                </blockquote>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line pt-3 text-xs text-ink-faint">
                <span>Source: {item.source}</span>
                <span>Published {formatDate(item.publicationDate)}</span>
                <span>Retrieved {formatDate(item.retrievedDate)}</span>
                {item.url && (
                  <a href={item.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-accent hover:underline">
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
