import { Scale } from "lucide-react";
import { lawyerService } from "@/services/api";
import { useAsync } from "@/hooks/useAsync";
import { Panel, PanelHeader, DataModeBanner, SimulationNotice, EmptyState } from "@/components/ui";
import { SkeletonPanel } from "@/components/ui/Skeleton";
import type { LawyerReview as LawyerReviewType, LawyerReviewItem } from "@/types";

const SECTIONS: { key: keyof Omit<LawyerReviewType, "generatedAt">; title: string; description: string }[] = [
  { key: "caseStrengths", title: "Case strengths", description: "Parts of your account that come across clearly and consistently." },
  { key: "potentialWeaknesses", title: "Potential weaknesses", description: "Points a skeptical reviewer might push on." },
  { key: "evidenceGaps", title: "Evidence gaps", description: "Claims that currently lack supporting documentation." },
  { key: "unclearFacts", title: "Unclear facts", description: "Details that could be stated more precisely." },
  { key: "issuesRequiringClarification", title: "Issues requiring clarification", description: "Open questions worth resolving before your hearing." },
  { key: "potentialLegalQuestions", title: "Potential legal questions", description: "Legal questions this simulation noticed, for context only." },
  { key: "questionsForYourRealLawyer", title: "Questions for your real lawyer", description: "Bring these to an actual legal representative." },
];

export function LawyerReview() {
  const { data, isMock, loading, error } = useAsync(() => lawyerService.getReview(), []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Lawyer review</h1>
        <p className="mt-1 text-sm text-ink-soft">
          An AI simulation reviewing your case the way a defending lawyer might, to help you see it from
          another angle.
        </p>
      </div>

      <SimulationNotice>
        <span className="flex items-center gap-1.5 font-medium">
          <Scale className="h-4 w-4" /> Lawyer simulation
        </span>
        <span className="mt-1 block">
          This is not your real lawyer and does not constitute legal advice. Always confirm important
          decisions with a qualified, licensed representative.
        </span>
      </SimulationNotice>

      <DataModeBanner isMock={isMock} />

      {loading ? (
        <SkeletonPanel />
      ) : error ? (
        <Panel><p className="text-sm text-brick">{error}</p></Panel>
      ) : !data ? null : !data.generatedAt ? (
        <Panel>
          <EmptyState
            title="No analysis available yet."
            description="Run a mock hearing or connect your case details so the lawyer simulation has something to review."
          />
        </Panel>
      ) : (
        <div className="space-y-5">
          {SECTIONS.map((section) => (
            <Panel key={section.key}>
              <PanelHeader title={section.title} description={section.description} />
              <ReviewItemList items={data[section.key]} />
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewItemList({ items }: { items: LawyerReviewItem[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-ink-soft">Nothing identified in this category yet.</p>;
  }
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.id} className="border-l-2 border-line-strong pl-3.5">
          <p className="text-sm font-medium text-ink">{item.title}</p>
          <p className="mt-0.5 text-sm text-ink-soft">{item.detail}</p>
        </li>
      ))}
    </ul>
  );
}
