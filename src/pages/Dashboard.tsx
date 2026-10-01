import { Link } from "react-router-dom";
import { MessagesSquare, FolderClosed, ScrollText, FileStack, Scale, Gavel } from "lucide-react";
import { caseService } from "@/services/api";
import { sessionsService } from "@/services/api";
import { useAsync } from "@/hooks/useAsync";
import { Panel, PanelHeader, StatTile, DataModeBanner, Badge } from "@/components/ui";
import { SkeletonPanel } from "@/components/ui/Skeleton";
import { PREPARATION_STAGE_LABELS, formatDate } from "@/lib/labels";
import { SESSION_TYPE_LABELS } from "@/types";

const QUICK_ACTIONS = [
  { label: "Start mock hearing", to: "/hearing", icon: MessagesSquare },
  { label: "Review my case", to: "/case", icon: FolderClosed },
  { label: "Review interview transcript", to: "/transcript", icon: ScrollText },
  { label: "Upload evidence", to: "/documents", icon: FileStack },
  { label: "Lawyer analysis", to: "/hearing/lawyer", icon: Scale },
  { label: "Judge evaluation", to: "/hearing/judge", icon: Gavel },
];

export function Dashboard() {
  const status = useAsync(() => caseService.getStatus(), []);
  const sessions = useAsync(() => sessionsService.list(), []);
  const latestSession = sessions.data?.[0];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Dashboard</h1>
        <p className="mt-1 text-sm text-ink-soft">
          An overview of your case preparation. Nothing on this page is submitted to BAMF or any court.
        </p>
      </div>

      <DataModeBanner isMock={status.isMock} />

      {status.loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse border border-line bg-paper-dim" />
          ))}
        </div>
      ) : status.error ? (
        <Panel>
          <p className="text-sm text-brick">{status.error}</p>
        </Panel>
      ) : status.data ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatTile label="Preparation stage" value={PREPARATION_STAGE_LABELS[status.data.preparationStage]} />
          <StatTile label="Transcript status" value={status.data.transcriptUploaded ? "Uploaded" : "Not uploaded"} />
          <StatTile label="Documents" value={status.data.documentCount} />
          <StatTile
            label="Open issues"
            value={status.data.openIssueCount}
            hint={status.data.resolvedIssueCount > 0 ? `${status.data.resolvedIssueCount} resolved` : undefined}
          />
          <StatTile label="Mock hearings" value={status.data.mockHearingCount} />
          <StatTile
            label="Latest session"
            value={status.data.lastSessionDate ? formatDate(status.data.lastSessionDate) : "None yet"}
            hint={status.data.lastSessionType ? SESSION_TYPE_LABELS[status.data.lastSessionType as keyof typeof SESSION_TYPE_LABELS] : undefined}
          />
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel>
            <PanelHeader title="Quick actions" description="Jump back into your preparation." />
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {QUICK_ACTIONS.map((action) => (
                <Link
                  key={action.to}
                  to={action.to}
                  className="flex items-center gap-3 border border-line px-4 py-3 text-sm text-ink transition-colors hover:border-accent hover:bg-accent-soft"
                >
                  <action.icon className="h-4 w-4 text-accent" aria-hidden />
                  {action.label}
                </Link>
              ))}
            </div>
          </Panel>
        </div>

        <div>
          <Panel>
            <PanelHeader title="Latest session" />
            {sessions.loading ? (
              <SkeletonPanel />
            ) : latestSession ? (
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-ink-soft">Type</span>
                  <Badge tone="accent">{SESSION_TYPE_LABELS[latestSession.type]}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ink-soft">Date</span>
                  <span className="text-ink">{formatDate(latestSession.date)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ink-soft">Issues identified</span>
                  <span className="text-ink">{latestSession.issuesIdentified}</span>
                </div>
                <Link
                  to="/sessions"
                  className="mt-2 flex w-full items-center justify-center border border-line-strong px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-ink hover:bg-paper-dim"
                >
                  View all sessions
                </Link>
              </div>
            ) : (
              <p className="text-sm text-ink-soft">No sessions yet. Start a mock hearing to begin.</p>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
