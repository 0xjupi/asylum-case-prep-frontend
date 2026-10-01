import { useState } from "react";
import { Send, ScrollText, AlertTriangle, FileStack } from "lucide-react";
import { hearingService } from "@/services/api";
import { useAsync } from "@/hooks/useAsync";
import { Panel, PanelHeader, Button, DataModeBanner, ParticipantBadge, SimulationNotice, EmptyState } from "@/components/ui";
import { SkeletonPanel } from "@/components/ui/Skeleton";
import type { AiParticipant } from "@/types";
import { clsx } from "clsx";

const PARTICIPANTS: { key: AiParticipant; label: string }[] = [
  { key: "bamf", label: "BAMF simulation" },
  { key: "lawyer", label: "Lawyer review" },
  { key: "judge", label: "Judge evaluation" },
];

export function MockHearing() {
  const { data, isMock, loading, error, reload } = useAsync(() => hearingService.getState(), []);
  const [activeParticipant, setActiveParticipant] = useState<AiParticipant>("bamf");
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const currentExchange = data?.exchanges.find((e) => e.questionNumber === data.currentQuestionNumber);

  async function handleSubmit() {
    if (!data || !answer.trim()) return;
    setSubmitting(true);
    try {
      await hearingService.submitAnswer(data, answer.trim());
      setAnswer("");
      reload();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStart() {
    await hearingService.start({});
    reload();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Mock hearing</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Practice answering questions from each simulated participant. Nothing you write here is sent anywhere official.
        </p>
      </div>

      <DataModeBanner isMock={isMock} />

      <div className="flex flex-wrap gap-1.5 border-b border-line pb-4">
        {PARTICIPANTS.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => setActiveParticipant(p.key)}
            className={clsx(
              "border px-3 py-1.5 text-sm transition-colors",
              activeParticipant === p.key ? "border-accent bg-accent-soft text-accent-dim" : "border-line-strong text-ink-soft hover:text-ink",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {loading ? (
        <SkeletonPanel />
      ) : error ? (
        <Panel><p className="text-sm text-brick">{error}</p></Panel>
      ) : !data ? null : data.status === "not_started" ? (
        <Panel>
          <EmptyState
            title="No session in progress."
            description="Start a mock hearing to begin practicing. You can choose a focus area from the BAMF simulation page, or start a general session here."
            actionLabel="Start session"
            onAction={handleStart}
          />
        </Panel>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Panel>
              <div className="flex items-center justify-between">
                <ParticipantBadge participant={activeParticipant} />
                <span className="text-xs text-ink-faint">
                  Question {data.currentQuestionNumber}
                  {data.totalQuestionsPlanned ? ` of ${data.totalQuestionsPlanned}` : ""}
                </span>
              </div>

              {activeParticipant === "bamf" && (
                <SimulationNotice tone="brick">
                  This simulation is designed to challenge your account. It is not a real BAMF official and its
                  questions are not part of your actual case file.
                </SimulationNotice>
              )}
              {activeParticipant === "lawyer" && (
                <SimulationNotice tone="neutral">
                  This is an AI simulation to help you prepare, not your real legal representative.
                </SimulationNotice>
              )}
              {activeParticipant === "judge" && (
                <SimulationNotice tone="slate">
                  This is an AI simulation for preparation purposes and is not a judicial decision.
                </SimulationNotice>
              )}

              {currentExchange ? (
                <div className="mt-4">
                  <p className="font-display text-lg leading-snug text-ink">{currentExchange.question}</p>

                  <label htmlFor="answer" className="mt-5 block text-sm font-medium text-ink">
                    Your answer
                  </label>
                  <textarea
                    id="answer"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    rows={5}
                    placeholder="Type your answer here…"
                    className="mt-2 w-full border border-line-strong bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-accent"
                  />
                  <div className="mt-3 flex justify-end">
                    <Button onClick={handleSubmit} disabled={!answer.trim() || submitting}>
                      <Send className="h-3.5 w-3.5" /> {submitting ? "Submitting…" : "Submit answer"}
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm text-ink-soft">No question is currently active.</p>
              )}
            </Panel>

            {data.exchanges.filter((e) => e.applicantAnswer).length > 0 && (
              <Panel>
                <PanelHeader title="This session so far" />
                <ol className="space-y-4">
                  {data.exchanges
                    .filter((e) => e.applicantAnswer)
                    .map((e) => (
                      <li key={e.id} className="border-b border-line pb-4 last:border-0 last:pb-0">
                        <p className="text-xs text-ink-faint">Question {e.questionNumber}</p>
                        <p className="mt-1 text-sm font-medium text-ink">{e.question}</p>
                        <p className="mt-1 text-sm text-ink-soft">{e.applicantAnswer}</p>
                      </li>
                    ))}
                </ol>
              </Panel>
            )}
          </div>

          <div className="space-y-4">
            <Panel>
              <PanelHeader title="Session progress" />
              <div className="h-1.5 w-full bg-paper-dim">
                <div
                  className="h-1.5 bg-accent"
                  style={{
                    width: data.totalQuestionsPlanned
                      ? `${Math.min(100, (data.currentQuestionNumber / data.totalQuestionsPlanned) * 100)}%`
                      : "10%",
                  }}
                />
              </div>
              <p className="mt-2 text-xs text-ink-soft">
                {data.exchanges.filter((e) => e.applicantAnswer).length} answered
                {data.totalQuestionsPlanned ? ` of ${data.totalQuestionsPlanned} planned` : ""}
              </p>
            </Panel>

            <Panel>
              <PanelHeader title="Observations" />
              {data.observations.length === 0 ? (
                <p className="text-sm text-ink-soft">No observations yet for this session.</p>
              ) : (
                <ul className="space-y-3">
                  {data.observations.map((obs) => (
                    <li key={obs.id} className="border border-line bg-paper-dim p-3">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-ochre">
                        <AlertTriangle className="h-3.5 w-3.5" /> {obs.label}
                      </div>
                      <p className="mt-1 text-sm text-ink-soft">{obs.detail}</p>
                      {obs.relatedTranscriptQuestionNumbers.length > 0 && (
                        <p className="mt-1.5 flex items-center gap-1 text-xs text-ink-faint">
                          <ScrollText className="h-3 w-3" /> Transcript Q{obs.relatedTranscriptQuestionNumbers.join(", Q")}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <Panel>
              <PanelHeader title="Relevant evidence" />
              <div className="flex items-center gap-2 text-sm text-ink-soft">
                <FileStack className="h-4 w-4" /> No evidence linked to the current question yet.
              </div>
            </Panel>
          </div>
        </div>
      )}
    </div>
  );
}
