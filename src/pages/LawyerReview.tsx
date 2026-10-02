import { useHashTarget } from "@/hooks/useHashTarget";
import { AnalysisSources } from "@/components/AnalysisSources";
import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Scale, Sparkles, AlertTriangle, History } from "lucide-react";
import { lawyerService } from "@/services/api";
import { useAsync } from "@/hooks/useAsync";
import { useSelectedSessionId } from "@/hooks/useSelectedSessionId";
import { useHearingSession } from "@/hooks/useHearingSession";
import { Panel, PanelHeader, Button, DataModeBanner, SimulationNotice, EmptyState, Badge } from "@/components/ui";
import { SkeletonPanel } from "@/components/ui/Skeleton";
import { getSafeErrorMessage } from "@/lib/errors";
import { formatDateTime } from "@/lib/labels";
import { clsx } from "clsx";
import type { LawyerReview as LawyerReviewType, LawyerReviewItem } from "@/types";

const SECTIONS: { key: keyof Omit<LawyerReviewType, "id" | "sessionId" | "version" | "generatedAt">; title: string; description: string }[] = [
  { key: "caseStrengths", title: "Case strengths", description: "Parts of your account that come across clearly and consistently." },
  { key: "potentialWeaknesses", title: "Potential weaknesses", description: "Points a skeptical reviewer might push on." },
  { key: "evidenceGaps", title: "Evidence gaps", description: "Claims that currently lack supporting documentation." },
  { key: "unclearFacts", title: "Unclear facts", description: "Details that could be stated more precisely." },
  { key: "issuesRequiringClarification", title: "Issues requiring clarification", description: "Open questions worth resolving before your hearing, including any conflict between your original interview and this mock hearing." },
  { key: "potentialLegalQuestions", title: "Potential legal questions", description: "Legal questions this simulation noticed, grounded in the legal sources currently available — for context only." },
  { key: "questionsForYourRealLawyer", title: "Questions for your real lawyer", description: "Bring these to an actual legal representative." },
];

const BASIS_LABELS: Record<string, string> = {
  fact: "Fact",
  applicant_statement: "Your statement",
  document_content: "From a document",
  ai_analysis: "AI analysis",
  uncertain: "Uncertain",
  contradiction: "Contradiction",
  missing_information: "Missing information",
};

export function LawyerReview() {
  const navigate = useNavigate();
  const { sessionId } = useSelectedSessionId();
  const hearingSession = useHearingSession(sessionId);
  // Only treat the session as usable once we've confirmed it actually exists.
  const confirmedSessionId = hearingSession.session ? sessionId : null;

  const { data, isMock, loading, error, reload } = useAsync(
    () =>
      confirmedSessionId
        ? lawyerService.getReview(confirmedSessionId)
        : Promise.resolve({ data: null, isMock: false, fetchedAt: new Date().toISOString() }),
    [confirmedSessionId],
  );
  const history = useAsync(
    () =>
      confirmedSessionId
        ? lawyerService.listHistory(confirmedSessionId)
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

  const displayedReview = useMemo(() => {
    if (selectedVersion == null) return data?.sessionId === sessionId ? data : null;
    return history.data?.find((r) => r.sessionId === sessionId && r.version === selectedVersion) ?? null;
  }, [selectedVersion, history.data, data, sessionId]);

  const isLoading = hearingSession.loading || (Boolean(confirmedSessionId) && (loading || history.loading));
  useHashTarget(displayedReview?.id, isLoading);
  const sessionNotCompleted = Boolean(hearingSession.session) && hearingSession.session?.status !== "completed";

  async function handleGenerate() {
    if (!confirmedSessionId || generating) return;
    setGenerating(true);
    setGenerateError(null);
    try {
      await lawyerService.generate(confirmedSessionId);
      setSelectedVersion(null); // show the newly generated (latest) version
      reload();
      history.reload();
    } catch (err) {
      setGenerateError(getSafeErrorMessage(err, "Something went wrong generating this review. Please try again."));
    } finally {
      setGenerating(false);
    }
  }

  const analyzeButton = (
    <Button size="sm" onClick={handleGenerate} disabled={generating || !confirmedSessionId || sessionNotCompleted}>
      <Sparkles className="h-3.5 w-3.5" />
      {generating ? "Analyzing…" : generateError ? "Try again" : displayedReview ? "Re-analyze with Lawyer" : "Analyze with Lawyer"}
    </Button>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Lawyer review</h1>
          <p className="mt-1 text-sm text-ink-soft">
            An AI simulation reviewing your case the way a defending lawyer might, to help you see it from
            another angle. Every review is generated on demand for a specific mock hearing session.
          </p>
        </div>
        {confirmedSessionId && !isLoading && analyzeButton}
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

      <DataModeBanner isMock={isMock || hearingSession.isMock} />

      {sessionId && <Link className="inline-block text-sm text-accent underline" to={`/preparation?sessionId=${sessionId}`}>View preparation findings</Link>}

      {sessionNotCompleted && (
        <div className="flex items-start gap-2.5 border border-ochre/30 bg-ochre-soft px-4 py-3 text-sm text-ochre">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            This hearing session is still active. Complete it before requesting a lawyer review.{" "}
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
            description="A lawyer review is generated for one specific hearing session. Open a session from Previous Sessions, or start a new mock hearing, to continue."
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
      ) : selectedVersion !== null && !displayedReview ? (
        <Panel><p>The requested analysis version is not available for this session.</p><Button className="mt-3" onClick={() => setSelectedVersion(null)}>Show latest version</Button></Panel>
      ) : !displayedReview ? (
        <Panel>
          <EmptyState
            title="No analysis yet for this session."
            description='Click "Analyze with Lawyer" above to generate a review of your case and this mock hearing session. This is never generated automatically.'
          />
        </Panel>
      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border border-line bg-surface px-4 py-3">
            <div className="flex items-center gap-3 text-sm">
              <Badge tone="accent">Version {displayedReview.version}</Badge>
              <span className="text-ink-faint">Generated {formatDateTime(displayedReview.generatedAt)}</span>
              <span className="text-ink-faint">· session {displayedReview.sessionId}</span>
            </div>
            {history.data && history.data.length > 1 && (
              <div className="flex items-center gap-1.5">
                <History className="h-3.5 w-3.5 text-ink-faint" />
                <div className="flex flex-wrap gap-1">
                  {history.data.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedVersion(r.version)}
                      className={clsx(
                        "border px-2 py-0.5 text-xs transition-colors",
                        (selectedVersion ?? data?.version) === r.version
                          ? "border-accent bg-accent-soft text-accent-dim"
                          : "border-line-strong text-ink-soft hover:text-ink",
                      )}
                    >
                      v{r.version}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {SECTIONS.map((section) => (
            <Panel key={section.key}>
              <PanelHeader title={section.title} description={section.description} />
              <ReviewItemList items={displayedReview[section.key]} />
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
        <li id={`finding-${item.id}`} key={item.id} className="border-l-2 border-line-strong pl-3.5">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-ink">{item.title}</p>
            {item.basis && <Badge tone="neutral">{BASIS_LABELS[item.basis] ?? item.basis}</Badge>}
          </div>
          <p className="mt-0.5 text-sm text-ink-soft">{item.detail}</p>
          {(item.relatedTranscriptQuestionNumbers?.length || item.relatedHearingQuestionNumbers?.length) && (
            <p className="mt-1 text-xs text-ink-faint">
              {item.relatedTranscriptQuestionNumbers?.length ? (
                <span>Original transcript Q{item.relatedTranscriptQuestionNumbers.join(", Q")}</span>
              ) : null}
              {item.relatedTranscriptQuestionNumbers?.length && item.relatedHearingQuestionNumbers?.length ? " · " : ""}
              {item.relatedHearingQuestionNumbers?.length ? (
                <span>Mock hearing Q{item.relatedHearingQuestionNumbers.join(", Q")}</span>
              ) : null}
            </p>
          )}
          <AnalysisSources links={item.sourceLinks} />
          {item.sourceNote && <p className="mt-1 text-xs italic text-ink-faint">{item.sourceNote}</p>}
        </li>
      ))}
    </ul>
  );
}
