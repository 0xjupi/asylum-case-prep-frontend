import { useState } from "react";
import { History } from "lucide-react";
import { sessionsService } from "@/services/api";
import { useAsync } from "@/hooks/useAsync";
import { Panel, DataModeBanner, EmptyState, Badge, ParticipantBadge } from "@/components/ui";
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
  const { data, isMock, loading, error } = useAsync(() => sessionsService.list(), []);
  const [selected, setSelected] = useState<SessionSummary | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-accent" />
          <h1 className="font-display text-2xl font-semibold text-ink">Previous sessions</h1>
        </div>
        <p className="mt-1 text-sm text-ink-soft">A record of every practice session, so you can track what's already been covered.</p>
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
                    <th className="px-4 py-2.5 font-normal">Duration</th>
                    <th className="px-4 py-2.5 font-normal">Status</th>
                    <th className="px-4 py-2.5 font-normal">Issues</th>
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
                      <td className="px-4 py-3 text-ink-soft">{session.durationMinutes ? `${session.durationMinutes} min` : "—"}</td>
                      <td className="px-4 py-3"><Badge tone={STATUS_TONE[session.status]}>{session.status.replace("_", " ")}</Badge></td>
                      <td className="px-4 py-3 text-ink-soft">{session.issuesIdentified}</td>
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
                    <div className="flex justify-between"><span className="text-ink-soft">Issues identified</span><span className="text-ink">{selected.issuesIdentified}</span></div>
                  </div>
                  {selected.type === "bamf_simulation" && <div className="mt-4"><ParticipantBadge participant="bamf" /></div>}
                  {selected.type === "lawyer_review" && <div className="mt-4"><ParticipantBadge participant="lawyer" /></div>}
                  {selected.type === "judge_evaluation" && <div className="mt-4"><ParticipantBadge participant="judge" /></div>}
                </div>
              ) : (
                <p className="text-sm text-ink-soft">Select a session to view its details.</p>
              )}
            </Panel>
          </div>
        </div>
      )}
    </div>
  );
}
