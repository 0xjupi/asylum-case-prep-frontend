import { useState } from "react";
import { Pencil, Check, X, MapPin } from "lucide-react";
import { caseService } from "@/services/api";
import { useAsync } from "@/hooks/useAsync";
import { Panel, PanelHeader, Button, DataModeBanner, EmptyState } from "@/components/ui";
import { SkeletonPanel } from "@/components/ui/Skeleton";
import { formatDate } from "@/lib/labels";
import type { CaseSummary, PersonalInformation, ClaimOverview } from "@/types";

const PERSONAL_FIELDS: { key: keyof PersonalInformation; label: string }[] = [
  { key: "fullName", label: "Full name" },
  { key: "nationality", label: "Nationality" },
  { key: "countryOfOrigin", label: "Country of origin" },
  { key: "dateOfBirth", label: "Date of birth" },
  { key: "caseReferenceNumber", label: "Case reference number" },
  { key: "bamfFileNumber", label: "BAMF file number" },
  { key: "dateOfEntry", label: "Date of entry" },
  { key: "dateOfApplication", label: "Date of application" },
  { key: "currentAddress", label: "Current address" },
];

const CLAIM_FIELDS: { key: keyof ClaimOverview; label: string; help: string }[] = [
  { key: "mainFactualEvents", label: "Main factual events", help: "What happened, in the order it happened." },
  { key: "reasonsForLeaving", label: "Reasons for leaving", help: "Why you left your country of origin." },
  { key: "relevantCircumstances", label: "Relevant circumstances", help: "Context that shapes how the claim is understood." },
  { key: "currentConcerns", label: "Current concerns", help: "What you're worried could happen if returned." },
];

export function MyCase() {
  const { data, isMock, loading, error, reload } = useAsync(() => caseService.getSummary(), []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">My case</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Nothing here is inferred or generated automatically. Add information yourself, or connect your
          uploaded documents and transcript to fill it in over time.
        </p>
      </div>

      <DataModeBanner isMock={isMock} />

      {loading ? (
        <div className="space-y-6">
          <SkeletonPanel />
          <SkeletonPanel />
        </div>
      ) : error ? (
        <Panel>
          <p className="text-sm text-brick">{error}</p>
        </Panel>
      ) : data ? (
        <>
          <PersonalInformationPanel data={data} onSaved={reload} />
          <TimelinePanel data={data} />
          <ClaimOverviewPanel data={data} onSaved={reload} />
        </>
      ) : null}
    </div>
  );
}

function PersonalInformationPanel({ data, onSaved }: { data: CaseSummary; onSaved: () => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(data.personalInformation);
  const [saving, setSaving] = useState(false);

  const hasAnyValue = PERSONAL_FIELDS.some((f) => Boolean(data.personalInformation[f.key]));

  async function handleSave() {
    setSaving(true);
    try {
      await caseService.update({ personalInformation: draft });
      setEditing(false);
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Panel>
      <PanelHeader
        title="Personal information"
        description="Basic details used to identify your case across the workspace."
        action={
          editing ? (
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setDraft(data.personalInformation); }}>
                <X className="h-3.5 w-3.5" /> Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                <Check className="h-3.5 w-3.5" /> {saving ? "Saving…" : "Save"}
              </Button>
            </div>
          ) : (
            <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Button>
          )
        }
      />

      {!hasAnyValue && !editing ? (
        <EmptyState
          title="No information added yet."
          description="Add your personal details so they can be referenced throughout your preparation."
          actionLabel="Add information"
          onAction={() => setEditing(true)}
        />
      ) : (
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          {PERSONAL_FIELDS.map((field) => (
            <div key={field.key}>
              <dt className="text-sm text-ink-soft">{field.label}</dt>
              {editing ? (
                <input
                  type="text"
                  value={draft[field.key] ?? ""}
                  onChange={(e) => setDraft((d) => ({ ...d, [field.key]: e.target.value || null }))}
                  className="mt-1 w-full border border-line-strong bg-surface px-2.5 py-1.5 text-sm text-ink outline-none focus:border-accent"
                />
              ) : (
                <dd className="mt-1 text-sm text-ink">{data.personalInformation[field.key] || "No information added yet."}</dd>
              )}
            </div>
          ))}
        </dl>
      )}
    </Panel>
  );
}

function TimelinePanel({ data }: { data: CaseSummary }) {
  return (
    <Panel>
      <PanelHeader title="Case timeline" description="Key events, in the order they happened, with supporting evidence linked where available." />
      {data.timeline.length === 0 ? (
        <EmptyState title="No timeline events added yet." description="Events you add here will help keep your account consistent across every simulation." />
      ) : (
        <ol className="space-y-0">
          {data.timeline.map((event, i) => (
            <li key={event.id} className="relative border-l border-line pb-6 pl-6 last:pb-0">
              <span className="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full border-2 border-accent bg-surface" />
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <p className="font-display text-sm font-semibold text-ink">{event.title}</p>
                <span className="text-xs text-ink-faint">{event.date ? formatDate(event.date) : event.approximateDate || "Date unknown"}</span>
              </div>
              {event.description && <p className="mt-1 text-sm text-ink-soft">{event.description}</p>}
              {event.location && (
                <p className="mt-1 flex items-center gap-1 text-xs text-ink-faint">
                  <MapPin className="h-3 w-3" /> {event.location}
                </p>
              )}
              {i === data.timeline.length - 1 && null}
            </li>
          ))}
        </ol>
      )}
    </Panel>
  );
}

function ClaimOverviewPanel({ data, onSaved }: { data: CaseSummary; onSaved: () => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(data.claimOverview);
  const [saving, setSaving] = useState(false);

  const hasAnyValue = CLAIM_FIELDS.some((f) => Boolean(data.claimOverview[f.key]));

  async function handleSave() {
    setSaving(true);
    try {
      await caseService.update({ claimOverview: draft });
      setEditing(false);
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Panel>
      <PanelHeader
        title="Claim overview"
        description="Written in your own words. This is what the simulations will use as your starting account."
        action={
          editing ? (
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setDraft(data.claimOverview); }}>
                <X className="h-3.5 w-3.5" /> Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                <Check className="h-3.5 w-3.5" /> {saving ? "Saving…" : "Save"}
              </Button>
            </div>
          ) : (
            <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Button>
          )
        }
      />
      {!hasAnyValue && !editing ? (
        <EmptyState
          title="No information added yet."
          description="Describe your claim in your own words to get started."
          actionLabel="Add information"
          onAction={() => setEditing(true)}
        />
      ) : (
        <div className="space-y-5">
          {CLAIM_FIELDS.map((field) => (
            <div key={field.key}>
              <p className="text-sm font-medium text-ink">{field.label}</p>
              <p className="text-xs text-ink-faint">{field.help}</p>
              {editing ? (
                <textarea
                  value={draft[field.key] ?? ""}
                  onChange={(e) => setDraft((d) => ({ ...d, [field.key]: e.target.value || null }))}
                  rows={3}
                  className="mt-2 w-full border border-line-strong bg-surface px-2.5 py-2 text-sm text-ink outline-none focus:border-accent"
                />
              ) : (
                <p className="mt-2 whitespace-pre-wrap text-sm text-ink-soft">
                  {data.claimOverview[field.key] || "No information added yet."}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
