import { useHashTarget } from "@/hooks/useHashTarget";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Send, ScrollText, AlertTriangle, FileStack, Scale, Gavel, History, CheckCircle2, FlagOff } from "lucide-react";
import { hearingService } from "@/services/api";
import { useSelectedSessionId } from "@/hooks/useSelectedSessionId";
import { useHearingSession } from "@/hooks/useHearingSession";
import { Panel, PanelHeader, Button, DataModeBanner, ParticipantBadge, SimulationNotice, EmptyState, Badge } from "@/components/ui";
import { SkeletonPanel } from "@/components/ui/Skeleton";
import { getSafeErrorMessage } from "@/lib/errors";
import { formatDateTime } from "@/lib/labels";
import type { AiParticipant } from "@/types";
import { clsx } from "clsx";
import { QuestionSources } from "@/components/QuestionSources";
import { getPendingStartConfig } from "@/lib/pendingHearingStart";

const PARTICIPANTS: { key: AiParticipant; label: string }[] = [
  { key: "bamf", label: "BAMF simulation" },
  { key: "lawyer", label: "Lawyer review" },
  { key: "judge", label: "Judge evaluation" },
];

export function MockHearing() {
  const { sessionId, selectSession } = useSelectedSessionId();
  const { session: data, isMock, loading, error, notFound, reload } = useHearingSession(sessionId);
  const [activeParticipant, setActiveParticipant] = useState<AiParticipant>("bamf");
  const [draft, setDraft] = useState<{ exchangeId: string | null; text: string }>({ exchangeId: null, text: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<{ exchangeId: string | null; message: string | null }>({ exchangeId: null, message: null });
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [confirmingComplete, setConfirmingComplete] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);

  const currentExchange = data?.exchanges.find((e) => e.questionNumber === data.currentQuestionNumber);
  const isComplete = data?.status === "completed";
  useHashTarget(data?.sessionId, loading);
  const generating = data?.generationStatus === "generating";
  const hasSavedAnswer = currentExchange?.applicantAnswer != null;
  const answer = draft.exchangeId === currentExchange?.id ? draft.text : "";
  const submitError = submissionError.exchangeId === currentExchange?.id ? submissionError.message : null;
  function setAnswer(text: string) { setDraft({ exchangeId: currentExchange?.id ?? null, text }); }
  function setSubmitError(message: string | null) { setSubmissionError({ exchangeId: currentExchange?.id ?? null, message }); }

  useEffect(() => {
    if (!generating) return;
    const interval = window.setInterval(reload, 2000);
    return () => window.clearInterval(interval);
  }, [generating, reload]);

  async function handleSubmit() {
    if (!data || !answer.trim() || submitting || hasSavedAnswer) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await hearingService.submitAnswer(data, answer.trim());
      setAnswer("");
      reload();
    } catch (err) {
      setSubmitError(getSafeErrorMessage(err, "Something went wrong submitting your answer. Please try again."));
      reload(); // distinguish a saved answer from a failed submission
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRetry() {
    if (!data || submitting || generating) return;
    setSubmitting(true);
    setSubmitError(null);
    try { await hearingService.retryQuestion(data); }
    catch (err) { setSubmitError(getSafeErrorMessage(err, "Could not generate the next question. Your answer is saved.")); }
    finally { reload(); setSubmitting(false); }
  }

  async function handleStart() {
    if (starting) return;
    setStarting(true);
    setStartError(null);
    try {
      const result = await hearingService.start(getPendingStartConfig() ?? {});
      // Starting a session always creates a brand-new one — select it
      // explicitly (updates the URL) so refreshing this page, or coming
      // back to it later from Previous Sessions, keeps pointing at it
      // rather than silently landing on whatever is newest at the time.
      selectSession(result.data.sessionId);
    } catch (err) {
      setStartError(getSafeErrorMessage(err, "Something went wrong starting this session. Please try again."));
    } finally {
      setStarting(false);
    }
  }

  async function handleComplete() {
    if (!data || completing) return;
    setCompleting(true);
    setCompleteError(null);
    try {
      await hearingService.complete(data.sessionId);
      setConfirmingComplete(false);
      reload(); // refreshes this page's state; Lawyer/Judge pages re-check on their own next load
    } catch (err) {
      setCompleteError(getSafeErrorMessage(err, "Something went wrong completing this session. Please try again."));
    } finally {
      setCompleting(false);
    }
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

      {loading && (!data || data.sessionId !== sessionId) ? (
        <SkeletonPanel />
      ) : error ? (
        <Panel><p className="text-sm text-brick">{error}</p></Panel>
      ) : !sessionId ? (
        <Panel>
          <EmptyState
            title="No hearing session selected."
            description="Start a new mock hearing, or open one of your previous sessions to continue it."
          />
          {startError && (
            <div className="mt-4 flex items-start gap-2.5 border border-brick/30 bg-brick-soft px-4 py-3 text-sm text-brick">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{startError}</p>
            </div>
          )}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <Button variant="secondary" size="sm" onClick={handleStart} disabled={starting}>
              {starting ? "Starting…" : startError ? "Try again" : "Start new hearing"}
            </Button>
            <Link to="/sessions" className="flex items-center gap-1.5 text-sm text-accent hover:underline">
              <History className="h-3.5 w-3.5" /> Open a previous session
            </Link>
          </div>
        </Panel>
      ) : notFound ? (
        <Panel>
          <p className="text-sm text-brick">This hearing session could not be found. It may have been removed.</p>
          <Link to="/sessions" className="mt-3 inline-block text-sm text-accent hover:underline">
            Back to Previous Sessions
          </Link>
        </Panel>
      ) : !data ? null : (
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

              {isComplete ? (
                <div className="mt-4 flex items-start gap-2.5 border border-line bg-paper-dim p-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <div>
                    <p className="text-sm font-medium text-ink">This hearing session is complete.</p>
                    <p className="mt-0.5 text-xs text-ink-faint">Completed {formatDateTime(data.completedAt)}. No further questions can be answered.</p>
                  </div>
                </div>
              ) : currentExchange ? (
                <div className="mt-4">
                  <p className="font-display text-lg leading-snug text-ink">{currentExchange.question}</p>
                  <QuestionSources exchange={currentExchange} />

                  {hasSavedAnswer ? <div className="mt-5 space-y-3 border-t border-line pt-4">
                    <p className="text-sm font-medium text-ink">Your answer is saved.</p>
                    <p className="whitespace-pre-wrap text-sm text-ink-soft">{currentExchange.applicantAnswer}</p>
                    <p className="text-sm text-ink-soft">{generating ? "The next question is being generated. This page will check for it automatically." : "The next question is not ready. Retry to continue from your saved answer."}</p>
                    {submitError && <p role="alert" className="text-sm text-brick">{submitError}</p>}
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" onClick={handleRetry} disabled={submitting || generating}>{submitting ? "Retrying…" : "Retry next question"}</Button>
                      <Button size="sm" variant="secondary" onClick={reload}>Check session</Button>
                    </div>
                  </div> : <>
                  <label htmlFor="answer" className="mt-5 block text-sm font-medium text-ink">
                    Your answer
                  </label>
                  <textarea
                    id="answer"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    rows={5}
                    maxLength={50000}
                    placeholder="Type your answer here…"
                    disabled={submitting}
                    className="mt-2 w-full border border-line-strong bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-accent disabled:opacity-60"
                  />
                  {submitError && (
                    <div className="mt-3 flex items-start gap-2.5 border border-brick/30 bg-brick-soft px-4 py-3 text-sm text-brick">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                      <p>{submitError}</p>
                    </div>
                  )}
                  <div className="mt-3 flex justify-end">
                    <Button onClick={handleSubmit} disabled={!answer.trim() || submitting}>
                      <Send className="h-3.5 w-3.5" />
                      {submitting ? "Submitting…" : submitError ? "Try again" : "Submit answer"}
                    </Button>
                  </div>
                  </>}
                </div>
              ) : (
                <p className="mt-4 text-sm text-ink-soft">No question is currently active.</p>
              )}

              {!isComplete && (
                <div className="mt-5 border-t border-line pt-4">
                  {completeError && (
                    <div className="mb-3 flex items-start gap-2.5 border border-brick/30 bg-brick-soft px-4 py-3 text-sm text-brick">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                      <p>{completeError}</p>
                    </div>
                  )}
                  {confirmingComplete ? (
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-sm text-ink">
                        Complete this hearing? You won't be able to answer further questions afterward.
                      </p>
                      <div className="ml-auto flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setConfirmingComplete(false)} disabled={completing}>
                          Cancel
                        </Button>
                        <Button variant="secondary" size="sm" onClick={handleComplete} disabled={completing}>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {completing ? "Completing…" : "Yes, complete hearing"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-end">
                      <Button variant="ghost" size="sm" onClick={() => setConfirmingComplete(true)}>
                        <FlagOff className="h-3.5 w-3.5" /> Complete hearing
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </Panel>

            {data.exchanges.filter((e) => e.applicantAnswer).length > 0 && (
              <Panel>
                <PanelHeader title="This session so far" />
                <ol className="space-y-4">
                  {data.exchanges
                    .filter((e) => e.applicantAnswer)
                    .map((e) => (
                      <li id={`exchange-${e.id}`} key={e.id} className="border-b border-line pb-4 last:border-0 last:pb-0 scroll-mt-8">
                        <p className="text-xs text-ink-faint">Question {e.questionNumber}</p>
                        <p className="mt-1 text-sm font-medium text-ink">{e.question}</p>
                        <p className="mt-1 text-sm text-ink-soft">{e.applicantAnswer}</p>
                        <QuestionSources exchange={e} />
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
                      ? `${Math.min(100, (data.answeredQuestionCount / data.totalQuestionsPlanned) * 100)}%`
                      : "10%",
                  }}
                />
              </div>
              <p className="mt-2 text-xs text-ink-soft">
                {data.answeredQuestionCount} answered
                {data.totalQuestionsPlanned ? ` of ${data.totalQuestionsPlanned} planned` : ""}
              </p>
            </Panel>

            <Panel>
              <PanelHeader
                title="This session"
                action={<Badge tone={isComplete ? "accent" : "ochre"}>{isComplete ? "Completed" : "Active"}</Badge>}
              />
              <p className="text-xs text-ink-faint">Session {data.sessionId}</p>
              <p className="mt-1 text-xs text-ink-faint">Started {formatDateTime(data.startedAt)}</p>
              {data.config && <p className="mt-2 text-xs text-ink-soft">Focus: {Object.entries(data.config).filter(([key, value]) => key !== "questionLimit" && key !== "useEntireTranscript" && value === true).map(([key]) => key.replace(/([A-Z])/g, " $1").replace(/^focus /, "").toLowerCase()).join(", ") || "standard"}</p>}
              {isComplete && <p className="text-xs text-ink-faint">Completed {formatDateTime(data.completedAt)}</p>}
              <div className="mt-3 space-y-2">
                <Link className="block text-sm text-accent underline" to={`/preparation?sessionId=${data.sessionId}`}>Preparation findings</Link>
                <Link
                  to={`/hearing/lawyer?sessionId=${data.sessionId}`}
                  className="flex items-center gap-1.5 text-sm text-accent hover:underline"
                >
                  <Scale className="h-3.5 w-3.5" /> Lawyer review for this session
                </Link>
                <Link
                  to={`/hearing/judge?sessionId=${data.sessionId}`}
                  className="flex items-center gap-1.5 text-sm text-accent hover:underline"
                >
                  <Gavel className="h-3.5 w-3.5" /> Judge evaluation for this session
                </Link>
              </div>
              {!isComplete && (
                <p className="mt-3 border-t border-line pt-3 text-xs text-ink-faint">
                  Complete this hearing to make it available for lawyer and judge analysis.
                </p>
              )}
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
              <PanelHeader title="Document references" />
              {currentExchange?.sourceReferences?.some(ref => ref.referenceType === "document" && ref.resolved) ?
                <ul className="space-y-2 text-sm text-ink-soft">{currentExchange.sourceReferences.filter(ref => ref.referenceType === "document" && ref.resolved).map((ref, i) => <li key={i} className="flex items-center gap-2"><FileStack className="h-4 w-4 shrink-0" /> {ref.snapshot?.name}</li>)}</ul> :
                <p className="text-sm text-ink-soft">No matched document references were recorded for this question.</p>}
            </Panel>
          </div>
        </div>
      )}
    </div>
  );
}
