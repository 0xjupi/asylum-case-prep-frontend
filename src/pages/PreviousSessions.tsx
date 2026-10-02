import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { History, Scale, Gavel } from "lucide-react";
import { sessionsService } from "@/services/api";
import { useAsync } from "@/hooks/useAsync";
import { Panel, Button, DataModeBanner, EmptyState, Badge, ParticipantBadge } from "@/components/ui";
import type { BadgeTone } from "@/components/ui";
import { SkeletonPanel } from "@/components/ui/Skeleton";
import { formatDate } from "@/lib/labels";
import { SESSION_TYPE_LABELS } from "@/types";
import type { SessionStatus, SessionSummary } from "@/types";

const STATUS_TONE: Record<SessionStatus, BadgeTone> = {
  completed: "accent",
  in_progress: "ochre",
  abandoned: "neutral",
};

export function PreviousSessions() {
  const navigate = useNavigate();
  const { data, isMock, loading, error } = useAsync(() => sessionsService.list(), []);
  const [selected, setSelected] = useState<SessionSummary | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-accent" />
          <h1 className="font-display text-2xl font-semibold text-ink">Previous sessions</h1>
        </div>
        <p className="mt-1 text-sm text-ink-soft">
          A record of every practice session. Open one to continue it, or to view its Lawyer review or Judge
          evaluation.
        </p>
      </div>

      <DataModeBanner isMock={isMock} />

      {loading ? (
        <SkeletonPanel />
      ) : error ? (
        <Panel><p className="text-sm text-brick">{error}</p></Panel>
      ) : !data || data.length === 0 ? (
        <Panel>
          <EmptyState title="No previous sessions." description="Sessions you complete will be listed here with their date, type, and any issues identified." />
        </Panel>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Panel padded={false}>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-xs text-ink-faint">
                    <th className="px-4 py-2.5 font-normal">Date</th>
                    <th className="px-4 py-2.5 font-normal">Type</th>
                    <th className="px-4 py-2.5 font-normal">Questions</th>
                    <th className="px-4 py-2.5 font-normal">Status</th>
                    <th className="px-4 py-2.5 font-normal">Lawyer</th>
                    <th className="px-4 py-2.5 font-normal">Judge</th>
                    <th className="px-4 py-2.5 font-normal"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {data.map((session) => (
                    <tr
                      key={session.id}
                      onClick={() => setSelected(session)}
                      className="cursor-pointer hover:bg-paper-dim"
                    >
                      <td className="px-4 py-3 text-ink">{formatDate(session.date)}</td>
                      <td className="px-4 py-3 text-ink-soft">{SESSION_TYPE_LABELS[session.type]}</td>
                      <td className="px-4 py-3 text-ink-soft">{session.questionCount ?? "—"}</td>
                      <td className="px-4 py-3"><Badge tone={STATUS_TONE[session.status]}>{session.status.replace("_", " ")}</Badge></td>
                      <td className="px-4 py-3 text-ink-soft">
                        {session.lawyerReviewAvailable ? `v${session.lawyerReviewLatestVersion}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-ink-soft">
                        {session.judgeEvaluationAvailable ? `v${session.judgeEvaluationLatestVersion}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/hearing?sessionId=${session.id}`);
                          }}
                        >
                          {session.status === "completed" ? "View hearing" : "Continue"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>
          </div>

          <div>
            <Panel>
              {selected ? (
                <div>
                  <p className="font-display text-base font-semibold text-ink">{SESSION_TYPE_LABELS[selected.type]}</p>
                  <p className="text-xs text-ink-faint">{formatDate(selected.date)}</p>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-ink-soft">Status</span><Badge tone={STATUS_TONE[selected.status]}>{selected.status.replace("_", " ")}</Badge></div>
                    <div className="flex justify-between"><span className="text-ink-soft">Questions</span><span className="text-ink">{selected.questionCount ?? "—"}</span></div>
                    <div className="flex justify-between"><span className="text-ink-soft">Duration</span><span className="text-ink">{selected.durationMinutes ? `${selected.durationMinutes} min` : "—"}</span></div>
                    <div className="flex justify-between"><span className="text-ink-soft">Completed</span><span className="text-ink">{selected.completedAt ? formatDate(selected.completedAt) : "—"}</span></div>
                    <div className="flex justify-between"><span className="text-ink-soft">Issues identified</span><span className="text-ink">{selected.issuesIdentified}</span></div>
                  </div>

                  <div className="mt-4 space-y-2 border-t border-line pt-4">
                    <Link className="block text-sm text-accent underline" to={`/preparation?sessionId=${selected.id}`}>Preparation findings</Link>
                    <Link
                      to={`/hearing?sessionId=${selected.id}`}
                      className="flex items-center gap-1.5 text-sm text-accent hover:underline"
                    >
                      <ParticipantBadge participant="bamf" />
                      <span className="ml-1">{selected.status === "completed" ? "View hearing" : "Continue hearing"}</span>
                    </Link>
                    <Link
                      to={`/hearing/lawyer?sessionId=${selected.id}`}
                      className="flex items-center gap-1.5 text-sm text-accent hover:underline"
                    >
                      <Scale className="h-3.5 w-3.5" />
                      {selected.lawyerReviewAvailable
                        ? `Lawyer review (v${selected.lawyerReviewLatestVersion})`
                        : selected.status === "completed"
                          ? "Lawyer review (not generated yet)"
                          : "Lawyer review (complete the hearing first)"}
                    </Link>
                    <Link
                      to={`/hearing/judge?sessionId=${selected.id}`}
                      className="flex items-center gap-1.5 text-sm text-accent hover:underline"
                    >
                      <Gavel className="h-3.5 w-3.5" />
                      {selected.judgeEvaluationAvailable
                        ? `Judge evaluation (v${selected.judgeEvaluationLatestVersion})`
                        : selected.status === "completed"
                          ? "Judge evaluation (not generated yet)"
                          : "Judge evaluation (complete the hearing first)"}
                    </Link>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-ink-soft">Select a session to view its details, or open it directly.</p>
              )}
            </Panel>
          </div>
        </div>
      )}
    </div>
  );
}
