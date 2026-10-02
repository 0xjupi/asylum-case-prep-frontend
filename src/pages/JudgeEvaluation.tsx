import { useHashTarget } from "@/hooks/useHashTarget";
import { AnalysisSources } from "@/components/AnalysisSources";
import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Gavel, Sparkles, AlertTriangle, History } from "lucide-react";
import { judgeService } from "@/services/api";
import { useAsync } from "@/hooks/useAsync";
import { useSelectedSessionId } from "@/hooks/useSelectedSessionId";
import { useHearingSession } from "@/hooks/useHearingSession";
import { Panel, PanelHeader, Button, DataModeBanner, SimulationNotice, EmptyState, Badge } from "@/components/ui";
import { SkeletonPanel } from "@/components/ui/Skeleton";
import { getSafeErrorMessage } from "@/lib/errors";
import { formatDateTime } from "@/lib/labels";
import { clsx } from "clsx";
import type { JudgeArgument, JudgeEvaluation as JudgeEvaluationType } from "@/types";

const BASIS_LABELS: Record<string, string> = {
  fact: "Fact",
  applicant_statement: "Applicant's statement",
  document_content: "From a document",
  ai_analysis: "AI analysis",
  uncertain: "Uncertain",
  contradiction: "Contradiction",
  missing_information: "Missing information",
};

export function JudgeEvaluation() {
  const navigate = useNavigate();
  const { sessionId } = useSelectedSessionId();
  const hearingSession = useHearingSession(sessionId);
  // Only treat the session as usable once we've confirmed it actually exists.
  const confirmedSessionId = hearingSession.session ? sessionId : null;

  const { data, isMock, loading, error, reload } = useAsync(
    () =>
      confirmedSessionId
        ? judgeService.getEvaluation(confirmedSessionId)
        : Promise.resolve({ data: null, isMock: false, fetchedAt: new Date().toISOString() }),
    [confirmedSessionId],
  );
  const history = useAsync(
    () =>
      confirmedSessionId
        ? judgeService.listHistory(confirmedSessionId)
        : Promise.resolve({ data: [], isMock: false, fetchedAt: new Date().toISOString() }),
    [confirmedSessionId],
  );

  const [versionParams, setVersionParams] = useSearchParams();
  const selectedVersion = versionParams.has("version") ? Number(versionParams.get("version")) : null;
  function setSelectedVersion(version: number | null) {
    const next = new URLSearchParams(versionParams);
    if (version === null) next.delete("version"); else next.set("version", String(version));
    setVersionParams(next);
  }
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const displayedEvaluation = useMemo<JudgeEvaluationType | null | undefined>(() => {
    if (selectedVersion == null) return data?.sessionId === sessionId ? data : null;
    return history.data?.find((e) => e.sessionId === sessionId && e.version === selectedVersion) ?? null;
  }, [selectedVersion, history.data, data, sessionId]);

  const isLoading = hearingSession.loading || (Boolean(confirmedSessionId) && (loading || history.loading));
  useHashTarget(displayedEvaluation?.id, isLoading);
  const sessionNotCompleted = Boolean(hearingSession.session) && hearingSession.session?.status !== "completed";

  async function handleGenerate() {
    if (!confirmedSessionId || generating) return;
    setGenerating(true);
    setGenerateError(null);
    try {
      await judgeService.generate(confirmedSessionId);
      setSelectedVersion(null); // show the newly generated (latest) version
      reload();
      history.reload();
    } catch (err) {
      // Includes the backend's "generate a lawyer review first" message
      // when applicable — it's already safe, user-facing text.
      setGenerateError(getSafeErrorMessage(err, "Something went wrong generating this evaluation. Please try again."));
    } finally {
      setGenerating(false);
    }
  }

  const analyzeButton = (
    <Button size="sm" onClick={handleGenerate} disabled={generating || !confirmedSessionId || sessionNotCompleted}>
      <Sparkles className="h-3.5 w-3.5" />
      {generating ? "Evaluating…" : generateError ? "Try again" : displayedEvaluation ? "Re-evaluate with Judge" : "Analyze with Judge"}
    </Button>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Judge evaluation</h1>
          <p className="mt-1 text-sm text-ink-soft">
            A neutral AI simulation that weighs both sides without automatically favoring either. Every
            evaluation is generated on demand for a specific mock hearing session.
          </p>
        </div>
        {confirmedSessionId && !isLoading && analyzeButton}
      </div>

      <SimulationNotice tone="slate">
        <span className="flex items-center gap-1.5 font-medium">
          <Gavel className="h-4 w-4" /> Judge simulation
        </span>
        <span className="mt-1 block">
          This is an AI simulation for preparation purposes only. It is not a real court decision, not a
          BAMF decision, not legal advice, not a prediction of any real outcome, and not a guarantee of
          asylum or refugee status.
        </span>
      </SimulationNotice>

      <DataModeBanner isMock={isMock || hearingSession.isMock} />

      {sessionId && <Link className="inline-block text-sm text-accent underline" to={`/preparation?sessionId=${sessionId}`}>View preparation findings</Link>}

      {sessionNotCompleted && (
        <div className="flex items-start gap-2.5 border border-ochre/30 bg-ochre-soft px-4 py-3 text-sm text-ochre">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            This hearing session is still active. Complete it before requesting a judge evaluation.{" "}
            <Link to={`/hearing?sessionId=${sessionId}`} className="underline">
              Go to the hearing
            </Link>
          </p>
        </div>
      )}

      {generateError && (
        <div className="flex items-start gap-2.5 border border-brick/30 bg-brick-soft px-4 py-3 text-sm text-brick">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{generateError}</p>
        </div>
      )}

      {isLoading ? (
        <SkeletonPanel />
      ) : hearingSession.error ? (
        <Panel><p className="text-sm text-brick">{hearingSession.error}</p></Panel>
      ) : !sessionId ? (
        <Panel>
          <EmptyState
            title="No hearing session selected."
            description="A judge evaluation is generated for one specific hearing session. Open a session from Previous Sessions, or start a new mock hearing, to continue."
            actionLabel="Go to Previous Sessions"
            onAction={() => navigate("/sessions")}
          />
        </Panel>
      ) : hearingSession.notFound ? (
        <Panel>
          <p className="text-sm text-brick">This hearing session could not be found. It may have been removed.</p>
          <Link to="/sessions" className="mt-3 inline-block text-sm text-accent hover:underline">
            Back to Previous Sessions
          </Link>
        </Panel>
      ) : error || history.error ? (
        <Panel><p className="text-sm text-brick">{error || history.error}</p></Panel>
      ) : selectedVersion !== null && !displayedEvaluation ? (
        <Panel><p>The requested analysis version is not available for this session.</p><Button className="mt-3" onClick={() => setSelectedVersion(null)}>Show latest version</Button></Panel>
      ) : !displayedEvaluation ? (
        <Panel>
          <EmptyState
            title="No evaluation yet for this session."
            description='Click "Analyze with Judge" above to generate a neutral evaluation. A lawyer review must be generated for this session first. This is never generated automatically.'
            actionLabel="Go to Lawyer review"
            onAction={() => navigate(`/hearing/lawyer?sessionId=${confirmedSessionId}`)}
          />
        </Panel>
      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border border-line bg-surface px-4 py-3">
            <div className="flex items-center gap-3 text-sm">
              <Badge tone="slate">Version {displayedEvaluation.version}</Badge>
              <span className="text-ink-faint">Generated {formatDateTime(displayedEvaluation.generatedAt)}</span>
              <span className="text-ink-faint">· session {displayedEvaluation.sessionId}</span>
            </div>
            {history.data && history.data.length > 1 && (
              <div className="flex items-center gap-1.5">
                <History className="h-3.5 w-3.5 text-ink-faint" />
                <div className="flex flex-wrap gap-1">
                  {history.data.map((e) => (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => setSelectedVersion(e.version)}
                      className={clsx(
                        "border px-2 py-0.5 text-xs transition-colors",
                        (selectedVersion ?? data?.version) === e.version
                          ? "border-slate bg-slate-soft text-slate"
                          : "border-line-strong text-ink-soft hover:text-ink",
                      )}
                    >
                      v{e.version}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <p className="text-sm text-ink-soft">{displayedEvaluation.lawyerReviewVersion ? <>Based on Lawyer <Link className="text-accent underline" to={`/hearing/lawyer?sessionId=${displayedEvaluation.sessionId}&version=${displayedEvaluation.lawyerReviewVersion}`}>v{displayedEvaluation.lawyerReviewVersion}</Link>.</> : "The source Lawyer version was not recorded for this older evaluation."}</p>
          <Panel>
            <PanelHeader title="Overall assessment" />
            <p className="text-sm text-ink-soft">{displayedEvaluation.overallAssessment}</p>
          </Panel>

          <div className="grid gap-5 sm:grid-cols-2">
            <Panel>
              <PanelHeader title="Factual consistency" />
              <p className="text-sm text-ink-soft">{displayedEvaluation.factualConsistency}</p>
            </Panel>
            <Panel>
              <PanelHeader title="Evidence" />
              <p className="text-sm text-ink-soft">{displayedEvaluation.evidenceAssessment}</p>
            </Panel>
            <Panel>
              <PanelHeader title="Country conditions" />
              <p className="text-sm text-ink-soft">{displayedEvaluation.countryConditionsAssessment}</p>
            </Panel>
            <Panel>
              <PanelHeader title="Credibility issues" />
              <TextList items={displayedEvaluation.credibilityIssues} empty="None noted." />
            </Panel>
          </div>

          <Panel>
            <PanelHeader title="Legal issues" />
            <TextList items={displayedEvaluation.legalIssues} empty="None noted." />
          </Panel>

          <div className="grid gap-5 sm:grid-cols-2">
            <Panel>
              <PanelHeader title="Arguments from the BAMF simulation" action={<Badge tone="brick">BAMF side</Badge>} />
              <ArgumentList arguments={displayedEvaluation.bamfArguments} />
            </Panel>
            <Panel>
              <PanelHeader title="Arguments from the lawyer simulation" action={<Badge tone="accent">Lawyer side</Badge>} />
              <ArgumentList arguments={displayedEvaluation.lawyerArguments} />
            </Panel>
          </div>

          <Panel>
            <PanelHeader title="Questions requiring clarification" />
            <TextList items={displayedEvaluation.questionsRequiringClarification} empty="None noted." />
          </Panel>
        </div>
      )}
    </div>
  );
}

function ArgumentList({ arguments: args }: { arguments: JudgeArgument[] }) {
  if (args.length === 0) return <p className="text-sm text-ink-soft">None raised.</p>;
  return (
    <ul className="space-y-3">
      {args.map((arg) => (
        <li id={`finding-${arg.id}`} key={arg.id} className="border-l-2 border-line-strong pl-3.5">
          <div className="flex flex-wrap items-center gap-2">
            {arg.basis && <Badge tone="neutral">{BASIS_LABELS[arg.basis] ?? arg.basis}</Badge>}
          </div>
          <p className="mt-0.5 text-sm text-ink-soft">{arg.summary}</p>
          {(arg.relatedTranscriptQuestionNumbers?.length || arg.relatedHearingQuestionNumbers?.length) && (
            <p className="mt-1 text-xs text-ink-faint">
              {arg.relatedTranscriptQuestionNumbers?.length ? <span>Original transcript Q{arg.relatedTranscriptQuestionNumbers.join(", Q")}</span> : null}
              {arg.relatedTranscriptQuestionNumbers?.length && arg.relatedHearingQuestionNumbers?.length ? " · " : ""}
              {arg.relatedHearingQuestionNumbers?.length ? <span>Mock hearing Q{arg.relatedHearingQuestionNumbers.join(", Q")}</span> : null}
            </p>
          )}
          <AnalysisSources links={arg.sourceLinks} />
          {arg.sourceNote && <p className="mt-1 text-xs italic text-ink-faint">{arg.sourceNote}</p>}
        </li>
      ))}
    </ul>
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
