import { Gavel } from "lucide-react";
import { judgeService } from "@/services/api";
import { useAsync } from "@/hooks/useAsync";
import { Panel, PanelHeader, DataModeBanner, SimulationNotice, EmptyState, Badge } from "@/components/ui";
import { SkeletonPanel } from "@/components/ui/Skeleton";

export function JudgeEvaluation() {
  const { data, isMock, loading, error } = useAsync(() => judgeService.getEvaluation(), []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Judge evaluation</h1>
        <p className="mt-1 text-sm text-ink-soft">
          A neutral AI simulation that weighs both sides without automatically favoring either.
        </p>
      </div>

      <SimulationNotice tone="slate">
        <span className="flex items-center gap-1.5 font-medium">
          <Gavel className="h-4 w-4" /> Judge simulation
        </span>
        <span className="mt-1 block">
          This is an AI simulation for preparation purposes and is not a judicial decision. It has no
          bearing on any real proceeding.
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
            title="No evaluation yet."
            description="An evaluation will appear here after you complete a mock hearing with both the BAMF and lawyer simulations."
          />
        </Panel>
      ) : (
        <div className="space-y-5">
          <Panel>
            <PanelHeader title="Overall assessment" />
            <p className="text-sm text-ink-soft">{data.overallAssessment}</p>
          </Panel>

          <div className="grid gap-5 sm:grid-cols-2">
            <Panel>
              <PanelHeader title="Factual consistency" />
              <p className="text-sm text-ink-soft">{data.factualConsistency}</p>
            </Panel>
            <Panel>
              <PanelHeader title="Evidence" />
              <p className="text-sm text-ink-soft">{data.evidenceAssessment}</p>
            </Panel>
            <Panel>
              <PanelHeader title="Country conditions" />
              <p className="text-sm text-ink-soft">{data.countryConditionsAssessment}</p>
            </Panel>
            <Panel>
              <PanelHeader title="Credibility issues" />
              <TextList items={data.credibilityIssues} empty="None noted." />
            </Panel>
          </div>

          <Panel>
            <PanelHeader title="Legal issues" />
            <TextList items={data.legalIssues} empty="None noted." />
          </Panel>

          <div className="grid gap-5 sm:grid-cols-2">
            <Panel>
              <PanelHeader title="Arguments from the BAMF simulation" action={<Badge tone="brick">BAMF side</Badge>} />
              <ul className="space-y-2">
                {data.bamfArguments.map((arg) => (
                  <li key={arg.id} className="text-sm text-ink-soft">{arg.summary}</li>
                ))}
              </ul>
            </Panel>
            <Panel>
              <PanelHeader title="Arguments from the lawyer simulation" action={<Badge tone="accent">Lawyer side</Badge>} />
              <ul className="space-y-2">
                {data.lawyerArguments.map((arg) => (
                  <li key={arg.id} className="text-sm text-ink-soft">{arg.summary}</li>
                ))}
              </ul>
            </Panel>
          </div>

          <Panel>
            <PanelHeader title="Questions requiring clarification" />
            <TextList items={data.questionsRequiringClarification} empty="None noted." />
          </Panel>
        </div>
      )}
    </div>
  );
}

function TextList({ items, empty }: { items: string[]; empty: string }) {
  if (items.length === 0) return <p className="text-sm text-ink-soft">{empty}</p>;
  return (
    <ul className="list-disc space-y-1.5 pl-4">
      {items.map((item, i) => (
        <li key={i} className="text-sm text-ink-soft">{item}</li>
      ))}
    </ul>
  );
}
